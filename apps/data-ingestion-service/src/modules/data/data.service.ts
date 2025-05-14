import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import axios from "axios";
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { EventStatus, EventType, OperationType } from "@app/shared/interfaces";
import { DataFetchDto } from "./dto/request";
import { EventService } from "../event/event.service";
import {
  MAX_LIMIT,
  MAX_RESULTS_PER_REQUEST,
  WIKI_API_URL,
} from "../../constants/wiki.constants";
import { DataRepository } from "./data.repository";
import { DataItem } from "./interfaces";
import { Filter } from "mongodb";

@Injectable()
export class DataService {
  private readonly downloadsDir = path.join(process.cwd(), "downloads");

  constructor(
    private readonly eventService: EventService,
    private readonly dataRepository: DataRepository
  ) {}

  async fetchData(dataFetchDto: DataFetchDto) {
    const { query, limit = 100, filename } = dataFetchDto;
    const startTime = Date.now();

    try {
      // Calculate how many API calls we need to make
      const requestsNeeded = Math.ceil(limit / MAX_RESULTS_PER_REQUEST);
      const actualLimit = Math.min(limit, MAX_LIMIT);

      // Generate a random name using timestamp and random number
      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const timestamp = Date.now().toString(36);
      const outputFilename = `${
        filename || query.replace(/\s+/g, "-")
      }-${timestamp}${randomSuffix}.json`;
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
        const offset = i * MAX_RESULTS_PER_REQUEST;
        const currentLimit = Math.min(
          MAX_RESULTS_PER_REQUEST,
          actualLimit - resultCount
        );

        const response = await axios.get(WIKI_API_URL, {
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
        status: EventStatus.SUCCESS,
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
        status: EventStatus.ERROR,
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
            createdAt: stats.birthtime.toISOString(),
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
        status: EventStatus.SUCCESS,
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
        status: EventStatus.ERROR,
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
        status: EventStatus.SUCCESS,
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
        status: EventStatus.ERROR,
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

  async bulkInsertData(data: DataItem[]) {
    await this.dataRepository.bulkInsert(data);
  }

  async analyzeQuery(criteria: Filter<DataItem>) {
    return this.dataRepository.analyzeQuery(criteria);
  }

  async find(criteria: Filter<DataItem>, skip: number, limit: number) {
    return this.dataRepository.find(criteria, skip, limit);
  }

  async count(criteria: Filter<DataItem>) {
    return this.dataRepository.count(criteria);
  }
}
