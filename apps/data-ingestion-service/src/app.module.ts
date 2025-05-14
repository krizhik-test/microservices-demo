import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { SharedModule, THROTTLE_LIMIT, THROTTLE_TTL } from "@app/shared";
import appConfig from "./config/app.config";
import { DataController } from "./controllers/data.controller";
import { FileController } from "./controllers/file.controller";
import { SearchController } from "./controllers/search.controller";
import { DebugController } from "./controllers/debug.controller";
import { DataService } from "./services/data.service";
import { FileService } from "./services/file.service";
import { SearchService } from "./services/search.service";
import { EventService } from "./services/event.service";
import { DataRepository } from "./repositories/data.repository";
import { ApiLogInterceptor } from "./decorators/interceptors/api-log.interceptor";
import { DebugService } from "./services/debug.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: THROTTLE_TTL,
        limit: THROTTLE_LIMIT,
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
    DebugService,
    FileService,
    SearchService,
    EventService,
    DataRepository,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useValue: ApiLogInterceptor,
    },
  ],
})
export class AppModule {}
