import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { ServiceName } from "@app/shared/constants";
import {
  RedisService,
  RedisTimeSeriesService,
  EventType,
  EventPayload,
  EventMessage,
} from "@app/shared";

@Injectable()
export class EventService {
  private readonly SERVICE_NAME = ServiceName.DATA_INGESTION;
  private readonly EVENT_CHANNEL = "events";

  constructor(
    private readonly redisService: RedisService,
    private readonly redisTimeSeriesService: RedisTimeSeriesService
  ) {}

  async publishEvent<T = any>(
    type: EventType,
    payload: Omit<EventPayload<T>, "id" | "timestamp" | "service">
  ) {
    const startTime = Date.now();

    try {
      const eventId = uuidv4();
      const timestamp = Date.now();

      const fullPayload: EventPayload<T> = {
        id: eventId,
        timestamp,
        service: this.SERVICE_NAME,
        ...payload,
      };

      const eventMessage: EventMessage<T> = {
        type,
        payload: fullPayload,
      };

      await this.redisService.publish(this.EVENT_CHANNEL, eventMessage);

      const executionTime = Date.now() - startTime;
      await this.redisTimeSeriesService.logEventTrace(
        this.SERVICE_NAME,
        "publish",
        this.EVENT_CHANNEL,
        executionTime
      );

      return { success: true, eventId };
    } catch (error) {
      console.error("Error publishing event:", error);
      throw error;
    }
  }
}
