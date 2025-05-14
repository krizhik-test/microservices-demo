import { Module } from "@nestjs/common";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";
import { TimeSeriesModule } from "../timeseries/timeseries.module";

@Module({
  imports: [TimeSeriesModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
