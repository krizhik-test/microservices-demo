import { Injectable, OnModuleInit } from "@nestjs/common";
import { RedisService, RedisTimeSeriesService } from "@app/shared";
import { EventsRepository } from "./events.repository";
import { ServiceName, EventChannel } from "@app/shared";

@Injectable()
export class EventsSubscriber implements OnModuleInit {
  private readonly EVENT_CHANNEL = EventChannel.EVENTS;
  private readonly SERVICE_NAME = ServiceName.LOGGING;

  constructor(
    private readonly redisService: RedisService,
    private readonly redisTimeSeriesService: RedisTimeSeriesService,
    private readonly eventsRepository: EventsRepository
  ) {}

  async onModuleInit() {
    await this.subscribeToEvents();
  }

  private async subscribeToEvents() {
    await this.redisService.subscribe(
      this.EVENT_CHANNEL,
      async (message, channel) => {
        const startTime = Date.now();

        try {
          const event = JSON.parse(message);

          await this.eventsRepository.insert(event);

          const executionTime = Date.now() - startTime;
          await this.redisTimeSeriesService.logEventTrace(
            this.SERVICE_NAME,
            "consume",
            channel,
            executionTime
          );
        } catch (error) {
          console.error("Error processing event:", error);
        }
      }
    );
  }
}
