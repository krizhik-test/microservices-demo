import { OmitType } from "@nestjs/swagger";
import { TimeSeriesQueryDto } from "./timeseries-query.dto";

export class ReportGenerationQueryDto extends OmitType(TimeSeriesQueryDto, [
  "aggregation",
] as const) {}
