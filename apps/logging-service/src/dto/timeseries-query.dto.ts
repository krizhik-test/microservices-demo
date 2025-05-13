import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsDateString, IsOptional } from "class-validator";
import {
  TimeSeriesType,
  AggregationType,
  HttpMethod,
  TimeSeriesEventType,
  ApiEndpoint,
} from "@app/shared/interfaces";
import { ServiceName } from "@app/shared";

export class TimeSeriesQueryDto {
  @ApiProperty({
    description: "Type of time series data",
    enum: TimeSeriesType,
    example: TimeSeriesType.API_REQUEST,
  })
  @IsEnum(TimeSeriesType)
  type: TimeSeriesType;

  @ApiProperty({
    description: "Start date for time range (ISO format)",
    example: "2025-01-01T00:00:00Z",
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: "End date for time range (ISO format)",
    example: "2025-12-31T23:59:59Z",
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: "Aggregation type for time series data",
    enum: AggregationType,
    required: false,
  })
  @IsOptional()
  @IsEnum(AggregationType)
  aggregation?: AggregationType;

  @ApiProperty({
    description: "Service name filter",
    example: ServiceName.DATA_INGESTION,
    required: false,
    enum: ServiceName,
  })
  @IsOptional()
  @IsEnum(ServiceName)
  service?: ServiceName;

  @ApiProperty({
    description: "Filter by API endpoint (for api_request type)",
    enum: ApiEndpoint,
    example: ApiEndpoint.DATA_FETCH,
    required: false,
  })
  @IsOptional()
  @IsEnum(ApiEndpoint)
  endpoint?: ApiEndpoint;

  @ApiProperty({
    description: "Filter by HTTP method (for api_request type)",
    enum: HttpMethod,
    example: HttpMethod.POST,
    required: false,
  })
  @IsOptional()
  @IsEnum(HttpMethod)
  method?: HttpMethod;

  @ApiProperty({
    description:
      "Filter by event type - publish or consume (for event_trace type)",
    enum: TimeSeriesEventType,
    required: false,
  })
  @IsOptional()
  @IsEnum(TimeSeriesEventType)
  eventType?: TimeSeriesEventType;
}
