import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { SharedModule, THROTTLE_LIMIT, THROTTLE_TTL } from "@app/shared";
import appConfig from "./config/app.config";
import { EventsController } from "./controllers/events.controller";
import { TimeSeriesController } from "./controllers/timeseries.controller";
import { ReportsController } from "./controllers/reports.controller";
import { EventsService } from "./services/events.service";
import { TimeSeriesService } from "./services/timeseries.service";
import { ReportsService } from "./services/reports.service";
import { EventsRepository } from "./repositories/events.repository";
import { EventsSubscriber } from "./subscribers/events.subscriber";
import { ApiLogInterceptor } from "./decorators/interceptors/api-log.interceptor";

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
  controllers: [EventsController, TimeSeriesController, ReportsController],
  providers: [
    EventsService,
    TimeSeriesService,
    ReportsService,
    EventsRepository,
    EventsSubscriber,
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
