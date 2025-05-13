import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { DataFetchDto } from "../dto/data-fetch.dto";
import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { EventService } from "./event.service";
import { EventType, OperationType } from "@app/shared/interfaces";

@Injectable()
export class DataService {
  private readonly downloadsDir = path.join(process.cwd(), "downloads");

  constructor(private readonly eventService: EventService) {}

  async fetchData(dataFetchDto: DataFetchDto) {
    const { query, limit = 100, filename } = dataFetchDto;
    const startTime = Date.now();

    try {
      // Calculate how many API calls we need to make
      // Wikipedia API has a limit of 500 results per request
      const maxResultsPerRequest = 500;
      const requestsNeeded = Math.ceil(limit / maxResultsPerRequest);
      const actualLimit = Math.min(limit, 10000); // Cap at 10,000 to avoid excessive API calls

      const outputFilename = `${
        filename || query.replace(/\s+/g, "-")
      }-${uuidv4().slice(0, 8)}.json`;
      const filePath = path.join(this.downloadsDir, outputFilename);

      await fs.promises.mkdir(this.downloadsDir, { recursive: true });

      const writeStream = fs.createWriteStream(filePath);

      const streamFinished = new Promise<void>((resolve, reject) => {
        writeStream.on("finish", resolve);
        writeStream.on("error", (err) => {
          console.error(`Error writing to file ${outputFilename}:`, err);
          reject(err);
        });
      });

      writeStream.write("{");
      writeStream.write('  "query": {\n');
      writeStream.write('    "searchinfo": { "totalhits": 0 },\n');
      writeStream.write('    "search": [\n');

      let totalResults = 0;
      let resultCount = 0;
      let isFirstBatch = true;

      for (let i = 0; i < requestsNeeded && resultCount < actualLimit; i++) {
        const offset = i * maxResultsPerRequest;
        const currentLimit = Math.min(
          maxResultsPerRequest,
          actualLimit - resultCount
        );

        const response = await axios.get("https://en.wikipedia.org/w/api.php", {
          params: {
            action: "query",
            list: "search",
            srsearch: query,
            format: "json",
            srlimit: currentLimit,
            sroffset: offset,
          },
        });

        const searchResults = response.data.query.search || [];

        if (i === 0 && response.data.query.searchinfo) {
          totalResults = response.data.query.searchinfo.totalhits;
        }
        for (let j = 0; j < searchResults.length; j++) {
          if (!isFirstBatch || j > 0) {
            writeStream.write(",\n");
          }
          writeStream.write("      " + JSON.stringify(searchResults[j]));
          resultCount++;
        }
        isFirstBatch = false;
        if (searchResults.length < currentLimit) {
          break;
        }

        // Add a small delay to avoid hitting rate limits
        if (i < requestsNeeded - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      writeStream.write("\n    ],\n");
      writeStream.write(`    "searchinfo": { "totalhits": ${totalResults} }\n`);
      writeStream.write("  },\n");

      const metaData = {
        originalQuery: query,
        requestedLimit: limit,
        actualResultsCount: resultCount,
        timestamp: new Date().toISOString(),
      };

      writeStream.write(
        '  "_meta": ' +
          JSON.stringify(metaData, null, 2).replace(/^/gm, "  ") +
          "\n"
      );

      writeStream.write("}");

      writeStream.end();
      await streamFinished;

      // Verify the file is readable
      await fs.promises.access(filePath, fs.constants.R_OK);

      const stats = fs.statSync(filePath);
      const result = {
        filename: outputFilename,
        size: stats.size,
        path: filePath,
        timestamp: new Date().toISOString(),
      };

      await this.eventService.publishEvent(EventType.DATA_FETCH, {
        operation: OperationType.FETCH_DATA,
        status: "success",
        data: {
          query,
          limit,
          filename: outputFilename,
          size: stats.size,
        },
        metadata: {
          executionTime: Date.now() - startTime,
        },
      });

      return result;
    } catch (error) {
      await this.eventService.publishEvent(EventType.DATA_FETCH, {
        operation: OperationType.FETCH_DATA,
        status: "error",
        data: {
          query,
          limit,
          error: error.message,
        },
        metadata: {
          executionTime: Date.now() - startTime,
        },
      });

      throw error;
    }
  }

  async listFiles() {
    const readdir = util.promisify(fs.readdir);
    const stat = util.promisify(fs.stat);

    const files = await readdir(this.downloadsDir);
    const fileDetails = await Promise.all(
      files
        .filter((file) => file.endsWith(".json"))
        .map(async (file) => {
          const filePath = path.join(this.downloadsDir, file);
          const stats = await stat(filePath);

          return {
            filename: file,
            size: stats.size,
            createdAt: stats.birthtime,
          };
        })
    );

    return fileDetails;
  }

  async deleteDownloadedFile(
    filename: string
  ): Promise<{ success: boolean; message: string }> {
    const startTime = Date.now();

    try {
      const filePath = path.join(this.downloadsDir, filename);

      if (!fs.existsSync(filePath)) {
        throw new NotFoundException(`File ${filename} not found`);
      }
      if (!filename.endsWith(".json")) {
        throw new BadRequestException("Only JSON files can be deleted");
      }

      await fs.promises.unlink(filePath);

      await this.eventService.publishEvent(EventType.DATA_DELETE, {
        operation: OperationType.DELETE_DOWNLOADED_FILE,
        status: "success",
        data: {
          filename,
        },
        metadata: {
          executionTime: Date.now() - startTime,
        },
      });

      return {
        success: true,
        message: `Downloaded file ${filename} deleted successfully`,
      };
    } catch (error) {
      await this.eventService.publishEvent(EventType.DATA_DELETE, {
        operation: OperationType.DELETE_DOWNLOADED_FILE,
        status: "error",
        data: {
          filename,
          error: error.message,
        },
        metadata: {
          executionTime: Date.now() - startTime,
        },
      });

      throw error;
    }
  }

  async deleteAllDownloadedFiles(): Promise<{
    success: boolean;
    count: number;
    message: string;
  }> {
    const startTime = Date.now();

    try {
      const files = await fs.promises.readdir(this.downloadsDir);
      const jsonFiles = files.filter((file) => file.endsWith(".json"));

      if (jsonFiles.length === 0) {
        return {
          success: true,
          count: 0,
          message: "No downloaded JSON files found to delete",
        };
      }

      const deletePromises = jsonFiles.map((file) => {
        const filePath = path.join(this.downloadsDir, file);
        return fs.promises.unlink(filePath);
      });

      await Promise.all(deletePromises);

      await this.eventService.publishEvent(EventType.DATA_DELETE, {
        operation: OperationType.DELETE_ALL_DOWNLOADED_FILES,
        status: "success",
        data: {
          count: jsonFiles.length,
        },
        metadata: {
          executionTime: Date.now() - startTime,
        },
      });

      return {
        success: true,
        count: jsonFiles.length,
        message: `${jsonFiles.length} downloaded JSON files deleted successfully`,
      };
    } catch (error) {
      await this.eventService.publishEvent(EventType.DATA_DELETE, {
        operation: OperationType.DELETE_ALL_DOWNLOADED_FILES,
        status: "error",
        data: {
          error: error.message,
        },
        metadata: {
          executionTime: Date.now() - startTime,
        },
      });

      throw error;
    }
  }
}
