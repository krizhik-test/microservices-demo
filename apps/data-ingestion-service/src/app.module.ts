import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { SharedModule, THROTTLE_LIMIT, THROTTLE_TTL } from "@app/shared";
import appConfig from "./config/app.config";
import {
  DataController,
  DebugController,
  FileController,
  SearchController,
} from "./controllers";
import {
  DataService,
  EventService,
  FileService,
  SearchService,
  DebugService,
} from "./services";
import { DataRepository } from "./repositories";
import { ApiLogInterceptor } from "./decorators/interceptors";

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
      useClass: ApiLogInterceptor,
    },
  ],
})
export class AppModule {}
