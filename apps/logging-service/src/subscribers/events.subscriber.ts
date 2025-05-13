import { Injectable, OnModuleInit } from "@nestjs/common";
import { RedisService, RedisTimeSeriesService } from "@app/shared";
import { EventsRepository } from "../repositories/events.repository";
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
    console.log(`Subscribed to ${this.EVENT_CHANNEL} channel`);
  }

  private async subscribeToEvents() {
    await this.redisService.subscribe(
      this.EVENT_CHANNEL,
      async (message, channel) => {
        const startTime = Date.now();

        try {
          // Parse the event message
          const event = JSON.parse(message);

          // Store the event in MongoDB
          await this.eventsRepository.insert(event);

          // Log event consumption
          const executionTime = Date.now() - startTime;
          await this.redisTimeSeriesService.logEventTrace(
            this.SERVICE_NAME,
            "consume",
            channel,
            executionTime
          );

          console.log(
            `Event processed: ${event.type} - ${event.payload.operation}`
          );
        } catch (error) {
          console.error("Error processing event:", error);
        }
      }
    );
  }
}
