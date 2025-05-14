import { Module, Global, DynamicModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongoDBService } from "./database/mongodb.service";
import { RedisService } from "./database/redis.service";
import { RedisTimeSeriesService } from "./database/redis-timeseries.service";
import appConfig from "./config/app.config";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
  ],
  providers: [MongoDBService, RedisService, RedisTimeSeriesService],
  exports: [MongoDBService, RedisService, RedisTimeSeriesService],
})
export class SharedModule {
  static forRoot(): DynamicModule {
    return {
      module: SharedModule,
      global: true,
    };
  }
}
