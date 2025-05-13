import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { SharedModule } from "@app/shared";
import { EventsController } from "./controllers/events.controller";
import { TimeSeriesController } from "./controllers/timeseries.controller";
import { ReportsController } from "./controllers/reports.controller";
import { EventsService } from "./services/events.service";
import { TimeSeriesService } from "./services/timeseries.service";
import { ReportsService } from "./services/reports.service";
import { EventsRepository } from "./repositories/events.repository";
import { EventsSubscriber } from "./subscribers/events.subscriber";

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
  ],
})
export class AppModule {}
