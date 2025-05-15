import { Module } from '@nestjs/common';
import { DataModule } from '../data/data.module';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { EventModule } from '../event/event.module';

@Module({
  imports: [DataModule, EventModule],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
