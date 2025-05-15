import { Module } from '@nestjs/common';
import { DataController } from './data.controller';
import { DataService } from './data.service';
import { DataRepository } from './data.repository';
import { EventModule } from '../event/event.module';

@Module({
  imports: [EventModule],
  controllers: [DataController],
  providers: [DataService, DataRepository],
  exports: [DataService],
})
export class DataModule {}
