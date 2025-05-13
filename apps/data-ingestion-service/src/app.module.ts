import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { SharedModule } from "@app/shared";
import { DataController } from './controllers/data.controller';
import { FileController } from './controllers/file.controller';
import { SearchController } from './controllers/search.controller';
import { DebugController } from './controllers/debug.controller';
import { DataService } from "./services/data.service";
import { FileService } from "./services/file.service";
import { SearchService } from "./services/search.service";
import { EventService } from "./services/event.service";
import { DataRepository } from "./repositories/data.repository";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env"],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    SharedModule.forRoot(),
  ],
  controllers: [
    DataController,
    FileController,
    SearchController,
    DebugController,
  ],
  providers: [
    DataService,
    FileService,
    SearchService,
    EventService,
    DataRepository,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
