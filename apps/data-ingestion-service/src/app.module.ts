import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { SharedModule, THROTTLE_LIMIT, THROTTLE_TTL } from "@app/shared";
import appConfig from "./configs/app.config";
import { ApiLogInterceptor } from "./decorators/interceptors";
import { DataModule } from "./modules/data/data.module";
import { DebugModule } from "./modules/debug/debug.module";
import { FileModule } from "./modules/file/file.module";
import { SearchModule } from "./modules/search/search.module";

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
    DataModule,
    DebugModule,
    FileModule,
    SearchModule,
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
