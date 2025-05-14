import { Module } from "@nestjs/common";
import { EventsController } from "./events.controller";
import { EventsRepository } from "./events.repository";
import { EventsService } from "./events.service";
import { EventsSubscriber } from "./events.subscriber";
import { SharedModule } from "@app/shared";

@Module({
  controllers: [EventsController],
  providers: [EventsService, EventsRepository, EventsSubscriber],
})
export class EventsModule {}
