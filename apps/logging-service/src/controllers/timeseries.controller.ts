import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ApiQueryTimeSeries } from "../swagger/timeseries.swagger";
import { TimeSeriesService } from "../services/timeseries.service";
import { TimeSeriesQueryDto } from "../dto/request/timeseries-query.dto";
import { TimeSeriesDto } from "../dto/response/timeseries-response.dto";

@ApiTags("timeseries")
@Controller("timeseries")
export class TimeSeriesController {
  constructor(private readonly timeSeriesService: TimeSeriesService) {}

  @Get()
  @ApiQueryTimeSeries()
  async queryTimeSeries(
    @Query() query: TimeSeriesQueryDto
  ): Promise<TimeSeriesDto[]> {
    return this.timeSeriesService.queryTimeSeries(query);
  }
}
