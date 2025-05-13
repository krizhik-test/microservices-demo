import { Controller, Get, Query, UseInterceptors } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ApiQueryTimeSeries } from "../swagger/timeseries.swagger";
import { TimeSeriesService } from "../services/timeseries.service";
import { TimeSeriesQueryDto } from "../dto/timeseries-query.dto";
import { ApiLogInterceptor } from "../decorators/api-log.interceptor";

@ApiTags("timeseries")
@Controller("timeseries")
@UseInterceptors(ApiLogInterceptor)
export class TimeSeriesController {
  constructor(private readonly timeSeriesService: TimeSeriesService) {}

  @Get()
  @ApiQueryTimeSeries()
  async queryTimeSeries(@Query() query: TimeSeriesQueryDto) {
    return this.timeSeriesService.queryTimeSeries(query);
  }
}
