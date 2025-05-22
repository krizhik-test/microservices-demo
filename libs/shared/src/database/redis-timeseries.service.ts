import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisService } from './redis.service';
import {
  TimeSeriesAggregationType,
  TimeSeriesDuplicatePolicies,
  TimeSeriesEncoding,
} from '@redis/time-series';
import {
  CreateOptions,
  TimeSeriesType,
  TimeSeriesResult,
  TimeSeriesEventType,
} from '../interfaces/timeseries.interface';
import { TIME_PERIODS } from '../constants';

@Injectable()
export class RedisTimeSeriesService implements OnModuleInit {
  private client: any;

  constructor(private readonly redisService: RedisService) {}

  async onModuleInit() {
    this.client = this.redisService.getClient();
  }

  /**
   * Create a new time series
   * @param key - The key for the time series
   * @param labels - Labels for the time series
   * @param retentionTime - Retention time in milliseconds (default: 30 days)
   * @private
   */
  private async createTimeSeries(
    key: string,
    labels: Record<string, string> = {},
    retentionTime: number = TIME_PERIODS.ONE_MONTH,
  ): Promise<string> {
    try {
      const options: CreateOptions = {
        ENCODING: TimeSeriesEncoding.UNCOMPRESSED,
        DUPLICATE_POLICY: TimeSeriesDuplicatePolicies.BLOCK,
      };

      if (retentionTime) {
        options.RETENTION = retentionTime;
      }

      if (Object.keys(labels).length > 0) {
        options.LABELS = labels;
      }

      return await this.client.ts.create(key, options);
    } catch (error) {
      // Ignore error if time series already exists
      if (error.message?.includes('already exists')) {
        return 'OK';
      }
      throw error;
    }
  }

  /**
   * Add a sample to a time series
   * @param key - The key for the time series
   * @param timestamp - Timestamp in milliseconds (* for automatic timestamp)
   * @param value - The value to add
   * @private
   */
  private async addSample(
    key: string,
    value: number,
    timestamp: number | '*' = '*',
  ): Promise<number> {
    if (timestamp === '*') {
      return this.client.ts.add(key, '*', value);
    } else {
      return this.client.ts.add(key, timestamp, value);
    }
  }

  /**
   * Query time series data by type and time range
   * @param type - Type of data (api_request or event_trace)
   * @param fromTimestamp - Start timestamp in milliseconds
   * @param toTimestamp - End timestamp in milliseconds
   * @param filters - Additional filters
   */
  async queryTimeSeriesData(
    type: TimeSeriesType,
    fromTimestamp: number,
    toTimestamp: number,
    filters: Record<string, string> = {},
    aggregation?: { type: string; bucketSizeMs: number },
  ): Promise<TimeSeriesResult[]> {
    try {
      // For Redis TimeSeries, we need to use a different approach to match our key patterns
      // Instead of filtering by labels, we'll use key pattern matching

      // First, let's build a key pattern based on the type and filters
      let keyPattern = '*';

      if (type === TimeSeriesType.API_REQUEST) {
        // API keys have format: api:service:method:endpoint:statusCode
        keyPattern = 'api:';

        // Add service if provided
        if (filters.service) {
          keyPattern += `${filters.service}:`;
        } else {
          keyPattern += '*:';
        }

        // Add method if provided
        if (filters.method) {
          keyPattern += `${filters.method}:`;
        } else {
          keyPattern += '*:';
        }

        // Add endpoint if provided (with wildcards for partial matching)
        if (filters.endpoint) {
          // Remove leading slash for better matching
          const endpoint = filters.endpoint.startsWith('/')
            ? filters.endpoint.substring(1)
            : filters.endpoint;
          keyPattern += `*${endpoint}*:`;
        } else {
          keyPattern += '*:';
        }

        // Add statusCode if provided
        if (filters.statusCode) {
          keyPattern += filters.statusCode;
        } else {
          keyPattern += '*';
        }
      } else if (type === TimeSeriesType.EVENT_TRACE) {
        // Event keys have format: event:service:eventType:channel
        keyPattern = 'event:';

        // Add service if provided
        if (filters.service) {
          keyPattern += `${filters.service}:`;
        } else {
          keyPattern += '*:';
        }

        // Add eventType if provided
        if (filters.eventType) {
          keyPattern += `${filters.eventType}:`;
        } else {
          keyPattern += '*:';
        }

        // Add channel if provided
        if (filters.channel) {
          keyPattern += filters.channel;
        } else {
          keyPattern += '*';
        }
      }

      // Get all keys matching the pattern
      const keys = await this.client.keys(keyPattern);

      if (!keys.length) {
        return [];
      }

      // For each key, get the time series data
      const results = [];

      for (const key of keys) {
        try {
          // Get the time series data for this key
          let range;

          if (aggregation) {
            range = await this.client.ts.range(
              key,
              fromTimestamp,
              toTimestamp,
              {
                AGGREGATION: {
                  type: aggregation.type as TimeSeriesAggregationType,
                  timeBucket: aggregation.bucketSizeMs,
                },
              },
            );
          } else {
            // Get raw data if no aggregation
            range = await this.client.ts.range(key, fromTimestamp, toTimestamp);
          }

          if (range && range.length > 0) {
            // Extract labels from the key
            const parts = key.split(':');
            const labels: Record<string, string> = { type: String(type) };

            if (type === TimeSeriesType.API_REQUEST && parts.length >= 4) {
              labels.service = parts[1] || '';
              labels.method = parts[2] || '';
              labels.endpoint = parts[3] || '';
              if (parts.length > 4) {
                labels.statusCode = parts[4] || '';
              }
            } else if (
              type === TimeSeriesType.EVENT_TRACE &&
              parts.length >= 4
            ) {
              labels.service = parts[1] || '';
              labels.eventType = parts[2] || '';
              labels.channel = parts[3] || '';
            }

            results.push({
              key,
              labels,
              data: range.map((point) => ({
                timestamp: Number(point.timestamp),
                value: Number(point.value),
              })),
            });
          }
        } catch (error) {
          console.error(
            `Error getting time series data for key ${key}:`,
            error,
          );
        }
      }

      return results;
    } catch (error) {
      console.error('Error in queryTimeSeriesData:', error);
      return [];
    }
  }

  /**
   * Log API request with execution time
   * @param serviceName - Name of the service
   * @param endpoint - API endpoint
   * @param method - HTTP method
   * @param statusCode - HTTP status code
   * @param executionTimeMs - Execution time in milliseconds
   */
  async logApiRequest(
    serviceName: string,
    endpoint: string,
    method: string,
    statusCode: number,
    executionTimeMs: number,
  ): Promise<number> {
    const key = `api:${serviceName}:${method}:${endpoint}:${statusCode}`;

    try {
      await this.createTimeSeries(key, {
        service: serviceName,
        endpoint,
        method,
        statusCode: statusCode.toString(),
        type: TimeSeriesType.API_REQUEST,
      }).catch(() => {
        // Ignore error if time series already exists
      });

      return this.addSample(key, executionTimeMs);
    } catch (error) {
      console.error('Error logging API request to Redis TimeSeries:', error);
      return -1;
    }
  }

  /**
   * Log event trace (publish or consume)
   * @param serviceName - Name of the service
   * @param eventType - Type of event (publish or consume)
   * @param channel - Event channel/topic
   * @param executionTimeMs - Execution time in milliseconds
   */
  async logEventTrace(
    serviceName: string,
    eventType: TimeSeriesEventType,
    channel: string,
    executionTimeMs: number,
  ): Promise<number> {
    const key = `event:${serviceName}:${eventType}:${channel}`;

    try {
      await this.createTimeSeries(key, {
        service: serviceName,
        eventType,
        channel,
        type: TimeSeriesType.EVENT_TRACE,
      }).catch(() => {
        // Ignore error if time series already exists
      });

      return this.addSample(key, executionTimeMs);
    } catch (error) {
      console.error('Error logging event trace to Redis TimeSeries:', error);
      return -1;
    }
  }
}
