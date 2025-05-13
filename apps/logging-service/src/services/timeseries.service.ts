import { Injectable } from "@nestjs/common";
import {
  EventChannel,
  RedisTimeSeriesService,
  ServiceName,
  TimeSeriesType,
} from "@app/shared";
import { TimeSeriesQueryDto } from "../dto/timeseries-query.dto";

@Injectable()
export class TimeSeriesService {
  constructor(
    private readonly redisTimeSeriesService: RedisTimeSeriesService
  ) {}

  async queryTimeSeries(query: TimeSeriesQueryDto) {
    const { type, startDate, endDate, aggregation } = query;

    const fromTimestamp = new Date(startDate).getTime();
    const toTimestamp = new Date(endDate).getTime();

    const filterCriteria: Record<string, string> = {};

    if (type === TimeSeriesType.API_REQUEST) {
      filterCriteria["service"] = query.service
        ? String(query.service)
        : String(ServiceName.DATA_INGESTION);

      if (query.method) {
        filterCriteria["method"] = String(query.method);
      }

      if (query.endpoint) {
        filterCriteria["endpoint"] = String(query.endpoint);
      }
    }

    if (type === TimeSeriesType.EVENT_TRACE) {
      filterCriteria["service"] = query.service
        ? String(query.service)
        : String(ServiceName.DATA_INGESTION);

      if (query.eventType) {
        filterCriteria["eventType"] = String(query.eventType);
      }
      filterCriteria["channel"] = String(EventChannel.EVENTS);
    }

    let aggregationConfig = undefined;
    if (aggregation) {
      const timeRangeMs = toTimestamp - fromTimestamp;
      let bucketSizeMs = 60000; // Default: 1 minute

      if (timeRangeMs > 86400000 * 30) {
        // > 30 days
        bucketSizeMs = 86400000; // 1 day
      } else if (timeRangeMs > 86400000 * 7) {
        // > 7 days
        bucketSizeMs = 3600000 * 6; // 6 hours
      } else if (timeRangeMs > 86400000) {
        // > 1 day
        bucketSizeMs = 3600000; // 1 hour
      } else if (timeRangeMs > 3600000 * 6) {
        // > 6 hours
        bucketSizeMs = 300000; // 5 minutes
      }

      aggregationConfig = {
        type: aggregation.toLowerCase(),
        bucketSizeMs,
      };
    }

    const result = await this.redisTimeSeriesService.queryTimeSeriesData(
      type,
      fromTimestamp,
      toTimestamp,
      filterCriteria,
      aggregationConfig
    );

    return this.transformTimeSeriesResult(result);
  }

  private transformTimeSeriesResult(result: any[]): any[] {
    if (!result || !Array.isArray(result)) {
      return [];
    }

    return result.map((series) => {
      const samples = series.samples || series.data || [];
      const data = Array.isArray(samples)
        ? samples.map((point) => ({
            timestamp: point.timestamp || Date.now(),
            value: point.value || 0,
          }))
        : [];

      return {
        key: series.key,
        labels: series.labels || {},
        data,
      };
    });
  }
}
