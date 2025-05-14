import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ApiQueryTimeSeries } from "../swagger";
import { TimeSeriesService } from "../services";
import { TimeSeriesQueryDto } from "../dto/request";
import { TimeSeriesDto } from "../dto/response";

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
