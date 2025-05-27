import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import axios from 'axios';
import { Response } from 'express';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EventStatus, EventType, OperationType } from '@app/shared/interfaces';
import { DataFetchDto } from './dto/request';
import { EventService } from '../event/event.service';
import {
  MAX_LIMIT,
  MAX_RESULTS_PER_REQUEST,
  WIKI_API_URL,
} from '../../constants/wiki.constants';
import { DataRepository } from './data.repository';
import { DataItem } from './interfaces';
import { Filter } from 'mongodb';

@Injectable()
export class DataService {
  private readonly downloadsDir = path.join(process.cwd(), 'downloads');

  constructor(
    private readonly eventService: EventService,
    private readonly dataRepository: DataRepository,
  ) {}

  async fetchData(dataFetchDto: DataFetchDto) {
    const { query, limit = 100, filename } = dataFetchDto;
    const startTime = Date.now();
    let writeStream: fs.WriteStream | null = null;
    let filePath = '';
    let outputFilename = '';
    let resultCount = 0;

    try {
      // Calculate how many API calls we need to make
      const requestsNeeded = Math.ceil(limit / MAX_RESULTS_PER_REQUEST);
      const actualLimit = Math.min(limit, MAX_LIMIT);

      // Generate a random name using timestamp and random number
      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const timestamp = Date.now().toString(36);
      outputFilename = `${
        filename || query.replace(/\s+/g, '-')
      }-${timestamp}${randomSuffix}.json`;
      filePath = path.join(this.downloadsDir, outputFilename);

      await fs.promises.mkdir(this.downloadsDir, { recursive: true });

      writeStream = fs.createWriteStream(filePath);

      const streamFinished = new Promise<void>((resolve, reject) => {
        writeStream!.on('finish', resolve);
        writeStream!.on('error', (err) => {
          console.error(`Error writing to file ${outputFilename}:`, err);
          reject(err);
        });
      });

      writeStream.write('{');
      writeStream.write('  "query": {\n');
      writeStream.write('    "searchinfo": { "totalhits": 0 },\n');
      writeStream.write('    "search": [\n');

      let totalResults = 0;
      let isFirstBatch = true;
      const MAX_RETRIES = 3;

      for (let i = 0; i < requestsNeeded && resultCount < actualLimit; i++) {
        const offset = i * MAX_RESULTS_PER_REQUEST;
        const currentLimit = Math.min(
          MAX_RESULTS_PER_REQUEST,
          actualLimit - resultCount,
        );

        let retries = 0;
        let success = false;
        let lastError: any = null;
        let searchResults: any[] = [];

        // Retry mechanism for connection issues
        while (retries < MAX_RETRIES && !success) {
          try {
            const response = await axios.get(WIKI_API_URL, {
              params: {
                action: 'query',
                list: 'search',
                srsearch: query,
                format: 'json',
                srlimit: currentLimit,
                sroffset: offset,
              },
              timeout: 10000, // 10 second timeout
            });

            searchResults = response.data.query.search || [];

            if (i === 0 && response.data.query.searchinfo) {
              totalResults = response.data.query.searchinfo.totalhits;
            }

            success = true;
          } catch (error) {
            lastError = error;
            retries++;
            console.warn(
              `API request failed (attempt ${retries}/${MAX_RETRIES}):`,
              error.message,
            );

            // Exponential backoff for retries
            if (retries < MAX_RETRIES) {
              const backoffTime = Math.pow(2, retries) * 500; // 1s, 2s, 4s
              await new Promise((resolve) => setTimeout(resolve, backoffTime));
            }
          }
        }

        // If all retries failed for this batch, log but continue with partial data
        if (!success) {
          console.error(
            `Failed to fetch batch ${
              i + 1
            }/${requestsNeeded} after ${MAX_RETRIES} attempts:`,
            lastError?.message,
          );
          // Continue with partial data - we'll save what we have so far
        } else {
          // Process the results if we got them
          for (let j = 0; j < searchResults.length; j++) {
            if (!isFirstBatch || j > 0) {
              writeStream.write(',\n');
            }
            writeStream.write(`      ${JSON.stringify(searchResults[j])}`);
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
      }

      // Finalize the file with the data we have so far
      writeStream.write('\n    ],\n');
      writeStream.write(`    "searchinfo": { "totalhits": ${totalResults} }\n`);
      writeStream.write('  },\n');

      const metaData = {
        originalQuery: query,
        requestedLimit: limit,
        actualResultsCount: resultCount,
        timestamp: new Date().toISOString(),
        complete: resultCount >= Math.min(limit, totalResults),
      };

      writeStream.write(
        `  "_meta": ${JSON.stringify(metaData, null, 2).replace(
          /^/gm,
          '  ',
        )}\n`,
      );

      writeStream.write('}');

      // Properly close the stream
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
        complete: metaData.complete,
      };

      await this.eventService.publishEvent(EventType.DATA_FETCH, {
        operation: OperationType.FETCH_DATA,
        status: EventStatus.SUCCESS,
        data: {
          query,
          limit,
          filename: outputFilename,
          size: stats.size,
          complete: metaData.complete,
        },
        metadata: {
          executionTime: Date.now() - startTime,
        },
      });

      return result;
    } catch (error) {
      // Make sure we close the write stream if it exists
      if (writeStream) {
        try {
          // If we have a partial file, try to finalize it properly
          if (resultCount > 0) {
            try {
              writeStream.write('\n    ],\n');
              writeStream.write(`    "searchinfo": { "totalhits": 0 }\n`);
              writeStream.write('  },\n');

              const metaData = {
                originalQuery: query,
                requestedLimit: limit,
                actualResultsCount: resultCount,
                timestamp: new Date().toISOString(),
                complete: false,
                error: error.message,
              };

              writeStream.write(
                `  "_meta": ${JSON.stringify(metaData, null, 2).replace(
                  /^/gm,
                  '  ',
                )}\n`,
              );

              writeStream.write('}');
            } catch (writeError) {
              console.error(
                'Error while trying to finalize partial file:',
                writeError,
              );
            }
          }

          // Always ensure the stream is closed
          writeStream.end();
        } catch (closeError) {
          console.error('Error closing file stream:', closeError);
        }
      }

      // Log the partial file information if we have any data
      if (resultCount > 0 && filePath) {
        try {
          const stats = fs.statSync(filePath);
          console.log(
            `Partial data saved to ${filePath} (${stats.size} bytes, ${resultCount} items)`,
          );

          // Use the standard error pattern but include information about the partial file
          await this.eventService.publishEvent(EventType.DATA_FETCH, {
            operation: OperationType.FETCH_DATA,
            status: EventStatus.ERROR,
            data: {
              query,
              limit,
              filename: outputFilename,
              size: stats.size,
              error: `${error.message} (Partial data saved: ${resultCount} items)`,
            },
            metadata: {
              executionTime: Date.now() - startTime,
            },
          });

          // Still throw the error to maintain consistent error handling pattern
          error.partialData = {
            filename: outputFilename,
            size: stats.size,
            path: filePath,
            itemsCount: resultCount,
          };
        } catch (statsError) {
          console.error('Error getting stats for partial file:', statsError);
        }
      }

      // If we couldn't save any partial data, publish error event
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
        .filter((file) => file.endsWith('.json'))
        .map(async (file) => {
          const filePath = path.join(this.downloadsDir, file);
          const stats = await stat(filePath);

          return {
            filename: file,
            size: stats.size,
            createdAt: stats.birthtime.toISOString(),
          };
        }),
    );

    return fileDetails;
  }

  async streamFileToResponse(filename: string, res: Response) {
    const filePath = path.join(this.downloadsDir, filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`File ${filename} not found`);
    }

    const stat = fs.statSync(filePath);

    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }

  async deleteDownloadedFile(
    filename: string,
  ): Promise<{ success: boolean; message: string }> {
    const startTime = Date.now();

    try {
      const filePath = path.join(this.downloadsDir, filename);

      if (!fs.existsSync(filePath)) {
        throw new NotFoundException(`File ${filename} not found`);
      }
      if (!filename.endsWith('.json')) {
        throw new BadRequestException('Only JSON files can be deleted');
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
      const jsonFiles = files.filter((file) => file.endsWith('.json'));

      if (jsonFiles.length === 0) {
        return {
          success: true,
          count: 0,
          message: 'No downloaded JSON files found to delete',
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
