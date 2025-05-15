import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { SharedModule, THROTTLE_LIMIT, THROTTLE_TTL } from '@app/shared';
import appConfig from './configs/app.config';
import { ApiLogInterceptor } from './decorators/interceptors/api-log.interceptor';
import { EventsModule } from './modules/events/events.module';
import { TimeSeriesModule } from './modules/timeseries/timeseries.module';
import { ReportsModule } from './modules/reports/reports.module';

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
    EventsModule,
    TimeSeriesModule,
    ReportsModule,
  ],
  providers: [
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
