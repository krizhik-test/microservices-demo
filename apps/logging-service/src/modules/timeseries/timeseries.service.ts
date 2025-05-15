import { Injectable } from '@nestjs/common';
import {
  EventChannel,
  RedisTimeSeriesService,
  ServiceName,
  TIME_PERIODS,
  TimeSeriesResult,
  TimeSeriesType,
} from '@app/shared';
import { TimeSeriesQueryDto } from './dto/request';
import { TimeSeriesDto } from './dto/response';

@Injectable()
export class TimeSeriesService {
  constructor(
    private readonly redisTimeSeriesService: RedisTimeSeriesService,
  ) {}

  async queryTimeSeries(query: TimeSeriesQueryDto) {
    const { type, startDate, endDate, aggregation } = query;

    const fromTimestamp = new Date(startDate).getTime();
    const toTimestamp = new Date(endDate).getTime();

    const filterCriteria: Record<string, string> = {};

    if (type === TimeSeriesType.API_REQUEST) {
      filterCriteria.service = query.service
        ? String(query.service)
        : String(ServiceName.DATA_INGESTION);

      if (query.method) {
        filterCriteria.method = String(query.method);
      }

      if (query.endpoint) {
        filterCriteria.endpoint = String(query.endpoint);
      }
    }

    if (type === TimeSeriesType.EVENT_TRACE) {
      filterCriteria.service = query.service
        ? String(query.service)
        : String(ServiceName.DATA_INGESTION);

      if (query.eventType) {
        filterCriteria.eventType = String(query.eventType);
      }
      filterCriteria.channel = String(EventChannel.EVENTS);
    }

    let aggregationConfig;
    if (aggregation) {
      const timeRangeMs = toTimestamp - fromTimestamp;
      let bucketSizeMs = TIME_PERIODS.ONE_MINUTE;

      if (timeRangeMs > TIME_PERIODS.ONE_MONTH) {
        bucketSizeMs = TIME_PERIODS.ONE_DAY;
      } else if (timeRangeMs > TIME_PERIODS.ONE_WEEK) {
        bucketSizeMs = TIME_PERIODS.SIX_HOURS;
      } else if (timeRangeMs > TIME_PERIODS.ONE_DAY) {
        bucketSizeMs = TIME_PERIODS.ONE_HOUR;
      } else if (timeRangeMs > TIME_PERIODS.SIX_HOURS) {
        bucketSizeMs = TIME_PERIODS.FIVE_MINUTES;
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
      aggregationConfig,
    );
    console.log('result', result);
    return this.transformTimeSeriesResult(result);
  }

  private transformTimeSeriesResult(
    result: TimeSeriesResult[],
  ): TimeSeriesDto[] {
    if (!result || !Array.isArray(result)) {
      return [];
    }

    return result.map((series) => {
      const data = series.data || [];
      const dataResult = Array.isArray(data)
        ? data.map((point) => ({
            timestamp: point.timestamp || Date.now(),
            value: point.value || 0,
          }))
        : [];

      return {
        key: series.key,
        labels: series.labels || {},
        data: dataResult,
      };
    });
  }
}
