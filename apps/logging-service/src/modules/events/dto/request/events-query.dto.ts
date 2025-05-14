import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";
import { EventStatus, EventType, OperationType } from "@app/shared/interfaces";

export class EventsQueryDto {
  @ApiPropertyOptional({
    description: "Event type filter",
    enum: EventType,
  })
  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @ApiPropertyOptional({
    description: "Start date for filtering events (ISO format)",
    example: "2025-01-01T00:00:00Z",
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: "End date for filtering events (ISO format)",
    example: "2025-12-31T23:59:59Z",
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: "Operation name filter",
    enum: OperationType,
  })
  @IsOptional()
  @IsEnum(OperationType)
  operation?: OperationType;

  @ApiPropertyOptional({
    description: "Status filter (success or error)",
    example: EventStatus.SUCCESS,
    enum: EventStatus,
  })
  @IsOptional()
  @IsString()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional({
    description: "Page number for pagination",
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Number of items per page",
    example: 10,
    default: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;
}
