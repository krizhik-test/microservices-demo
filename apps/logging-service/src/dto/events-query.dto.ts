import { ApiProperty } from "@nestjs/swagger";
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
import { EventType, OperationType } from "@app/shared/interfaces";

export class EventsQueryDto {
  @ApiProperty({
    description: "Event type filter",
    enum: EventType,
    required: false,
  })
  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @ApiProperty({
    description: "Start date for filtering events (ISO format)",
    example: "2025-01-01T00:00:00Z",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: "End date for filtering events (ISO format)",
    example: "2025-12-31T23:59:59Z",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: "Operation name filter",
    enum: OperationType,
    enumName: "OperationType",
    required: false,
  })
  @IsOptional()
  @IsEnum(OperationType)
  operation?: OperationType;

  @ApiProperty({
    description: "Status filter (success or error)",
    example: "success",
    enum: ["success", "error"],
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: "success" | "error";

  @ApiProperty({
    description: "Page number for pagination",
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: "Number of items per page",
    example: 10,
    default: 10,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;
}
