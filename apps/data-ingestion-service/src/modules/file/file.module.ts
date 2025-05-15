import { Module } from '@nestjs/common';
import { DataModule } from '../data/data.module';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { EventModule } from '../event/event.module';

@Module({
  imports: [DataModule, EventModule],
  providers: [FileService],
  controllers: [FileController],
})
export class FileModule {}
