import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Response } from "express";
import * as fs from "fs";
import * as path from "path";
import { streamArray } from "stream-json/streamers/StreamArray";
import { pick } from "stream-json/filters/Pick";
import { chain } from "stream-chain";
import { EventType } from "@app/shared";
import { EventStatus, OperationType } from "@app/shared/interfaces";
import { EventService } from "./event.service";
import { DataRepository } from "../repositories/data.repository";
import { parser } from "stream-json/Parser";
import { DataItem } from "../interfaces/data-item.interface";

@Injectable()
export class FileService {
  private readonly downloadsDir = path.join(process.cwd(), "downloads");
  private readonly uploadsDir = path.join(process.cwd(), "uploads");

  constructor(
    private readonly eventService: EventService,
    private readonly dataRepository: DataRepository
  ) {}

  async deleteFile(
    filename: string
  ): Promise<{ success: boolean; message: string }> {
    const startTime = Date.now();

    try {
      const filePath = path.join(this.uploadsDir, filename);

      if (!fs.existsSync(filePath)) {
        throw new NotFoundException(`File ${filename} not found`);
      }

      if (!filename.endsWith(".json")) {
        throw new BadRequestException("Only JSON files can be deleted");
      }

      await fs.promises.unlink(filePath);

      await this.eventService.publishEvent(EventType.DATA_DELETE, {
        operation: OperationType.DELETE_FILE,
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
        message: `File ${filename} deleted successfully`,
      };
    } catch (error) {
      await this.eventService.publishEvent(EventType.DATA_DELETE, {
        operation: OperationType.DELETE_FILE,
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

  async deleteAllFiles(): Promise<{
    success: boolean;
    count: number;
    message: string;
  }> {
    const startTime = Date.now();

    try {
      const files = await fs.promises.readdir(this.uploadsDir);
      const jsonFiles = files.filter((file) => file.endsWith(".json"));

      if (jsonFiles.length === 0) {
        return {
          success: true,
          count: 0,
          message: "No JSON files found to delete",
        };
      }

      const deletePromises = jsonFiles.map((file) => {
        const filePath = path.join(this.uploadsDir, file);
        return fs.promises.unlink(filePath);
      });

      await Promise.all(deletePromises);

      await this.eventService.publishEvent(EventType.DATA_DELETE, {
        operation: OperationType.DELETE_ALL_FILES,
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
        message: `${jsonFiles.length} JSON files deleted successfully`,
      };
    } catch (error) {
      await this.eventService.publishEvent(EventType.DATA_DELETE, {
        operation: OperationType.DELETE_ALL_FILES,
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

  async listUploadedFiles() {
    const files = await fs.promises.readdir(this.uploadsDir);
    const fileDetails = await Promise.all(
      files
        .filter((file) => file.endsWith(".json"))
        .map(async (file) => {
          const filePath = path.join(this.uploadsDir, file);
          const stats = await fs.promises.stat(filePath);

          return {
            filename: file,
            size: stats.size,
            createdAt: stats.birthtime.toISOString(),
          };
        })
    );

    return fileDetails;
  }

  async processUploadedFile(file: Express.Multer.File) {
    const startTime = Date.now();

    try {
      if (!file) {
        throw new BadRequestException("No file uploaded");
      }

      if (!file.originalname.endsWith(".json")) {
        throw new BadRequestException("Only JSON files are supported");
      }

      // Save the file to the uploads directory
      const filename = `${
        path.parse(file.originalname).name
      }-${Date.now()}.json`;
      const filePath = path.join(this.uploadsDir, filename);

      // Use streams to efficiently write the file
      if (file.buffer) {
        // If file.buffer exists, use it
        await fs.promises.writeFile(filePath, file.buffer);
      } else if (file.path) {
        // If file.path exists (file is saved to disk by multer), copy it
        await fs.promises.copyFile(file.path, filePath);
      } else {
        throw new BadRequestException("Invalid file data");
      }

      const result = await this.processJsonFile(filePath, filename);

      await this.eventService.publishEvent(EventType.DATA_UPLOAD, {
        operation: OperationType.UPLOAD_FILE,
        status: "success",
        data: {
          filename,
          originalFilename: file.originalname,
          recordsProcessed: result.recordsProcessed,
        },
        metadata: {
          executionTime: Date.now() - startTime,
        },
      });

      return result;
    } catch (error) {
      await this.eventService.publishEvent(EventType.DATA_UPLOAD, {
        operation: OperationType.UPLOAD_FILE,
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

  async processExistingFile(filename: string) {
    const startTime = Date.now();

    try {
      const filePath = path.join(this.downloadsDir, filename);

      if (!fs.existsSync(filePath)) {
        throw new NotFoundException(`File ${filename} not found`);
      }

      if (!filename.endsWith(".json")) {
        throw new BadRequestException("Only JSON files are supported");
      }

      const result = await this.processJsonFile(filePath, filename);

      await this.eventService.publishEvent(EventType.DATA_UPLOAD, {
        operation: OperationType.PROCESS_FILE,
        status: EventStatus.SUCCESS,
        data: {
          filename,
          recordsProcessed: result.recordsProcessed,
        },
        metadata: {
          executionTime: Date.now() - startTime,
        },
      });

      return result;
    } catch (error) {
      await this.eventService.publishEvent(EventType.DATA_UPLOAD, {
        operation: OperationType.PROCESS_FILE,
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

  async streamFileToResponse(filename: string, res: Response) {
    const filePath = path.join(this.downloadsDir, filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`File ${filename} not found`);
    }

    const stat = fs.statSync(filePath);

    res.setHeader("Content-Length", stat.size);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }

  private async processJsonFile(filePath: string, filename: string) {
    return new Promise<{
      filename: string;
      recordsProcessed: number;
      timestamp: string;
    }>((resolve, reject) => {
      let recordsProcessed = 0;
      let processingComplete = false;
      let pendingWrites = 0;
      const BATCH_SIZE = 100;
      let currentBatch: DataItem[] = [];

      const checkIfComplete = () => {
        if (processingComplete && pendingWrites === 0) {
          resolve({
            filename,
            recordsProcessed,
            timestamp: new Date().toISOString(),
          });
        }
      };

      const processBatch = async (batch: DataItem[]) => {
        if (batch.length === 0) return;
        pendingWrites++;
        try {
          await this.dataRepository.bulkInsert(batch);
          recordsProcessed += batch.length;
        } catch (error) {
          console.error("Error inserting batch:", error);
          throw error;
        } finally {
          pendingWrites--;
          checkIfComplete();
        }
      };

      try {
        const fileHeader = fs
          .readFileSync(filePath, { encoding: "utf8", flag: "r" })
          .slice(0, 200);
        const isWikipediaFormat =
          fileHeader.includes('"query"') && fileHeader.includes('"search"');

        const fileStream = fs.createReadStream(filePath, { encoding: "utf8" });
        let pipeline;

        if (isWikipediaFormat) {
          pipeline = chain([
            fileStream,
            parser(),
            pick({ filter: "query.search" }),
            streamArray(),
          ]);
          pipeline.on("data", ({ value }) => {
            const transformedItem = {
              ...value,
              source: "wikipedia",
              importedAt: new Date(),
            };

            currentBatch.push(transformedItem);

            if (currentBatch.length >= BATCH_SIZE) {
              const batchToProcess = [...currentBatch];
              currentBatch = [];
              processBatch(batchToProcess).catch(reject);
            }
          });
        } else {
          pipeline = chain([fileStream, parser(), streamArray()]);
          pipeline.on("data", ({ value }) => {
            const transformedItem = {
              ...value,
              importedAt: new Date(),
            };

            currentBatch.push(transformedItem);

            if (currentBatch.length >= BATCH_SIZE) {
              const batchToProcess = [...currentBatch];
              currentBatch = [];

              processBatch(batchToProcess).catch(reject);
            }
          });
        }

        pipeline.on("end", async () => {
          if (currentBatch.length > 0) {
            const finalBatch = [...currentBatch];
            currentBatch = [];
            try {
              await processBatch(finalBatch);
            } catch (error) {
              return reject(error);
            }
          }

          processingComplete = true;
          checkIfComplete();
        });

        pipeline.on("error", (err) => {
          reject(
            new BadRequestException(
              `Error processing JSON file: ${err.message}`
            )
          );
        });
      } catch (error) {
        return reject(
          new BadRequestException(
            `Error processing JSON file: ${error.message}`
          )
        );
      }
    });
  }
}
