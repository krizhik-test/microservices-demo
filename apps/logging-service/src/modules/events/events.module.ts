import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsRepository } from './events.repository';
import { EventsService } from './events.service';
import { EventsSubscriber } from './events.subscriber';

@Module({
  controllers: [EventsController],
  providers: [EventsService, EventsRepository, EventsSubscriber],
})
export class EventsModule {}
