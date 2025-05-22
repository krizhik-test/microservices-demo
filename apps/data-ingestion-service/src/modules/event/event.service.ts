import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { EventChannel, ServiceName } from '@app/shared/constants';
import { TimeSeriesEventType } from '../../../../../libs/shared/src/interfaces/timeseries.interface';
import {
  RedisService,
  RedisTimeSeriesService,
  EventType,
  EventPayload,
  EventMessage,
} from '@app/shared';

@Injectable()
export class EventService {
  private readonly SERVICE_NAME = ServiceName.DATA_INGESTION;
  private readonly EVENT_CHANNEL = EventChannel.EVENTS;

  constructor(
    private readonly redisService: RedisService,
    private readonly redisTimeSeriesService: RedisTimeSeriesService,
  ) {}

  async publishEvent<T = any>(
    type: EventType,
    payload: Omit<EventPayload<T>, 'timestamp' | 'service'>,
  ) {
    const startTime = Date.now();

    try {
      const timestamp = Date.now();

      const eventId = new ObjectId();
      const fullPayload: EventPayload<T> = {
        timestamp,
        service: this.SERVICE_NAME,
        ...payload,
      };

      const eventMessage: EventMessage<T> = {
        _id: eventId,
        type,
        payload: fullPayload,
      };

      await this.redisService.publish(this.EVENT_CHANNEL, eventMessage);

      const executionTime = Date.now() - startTime;
      await this.redisTimeSeriesService.logEventTrace(
        this.SERVICE_NAME,
        TimeSeriesEventType.PUBLISH,
        this.EVENT_CHANNEL,
        executionTime,
      );

      return { success: true, eventId: eventId.toString() };
    } catch (error) {
      console.error('Error publishing event:', error);
      throw error;
    }
  }
}
