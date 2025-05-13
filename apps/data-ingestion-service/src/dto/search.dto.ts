import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsInt, Min } from "class-validator";
import { Type } from "class-transformer";

export class SearchDto {
  @ApiProperty({
    description: "Search query string (in title or snippet)",
    example: "pizza",
    required: false,
  })
  @IsOptional()
  @IsString()
  query?: string;

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
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({
    description: "Filter by title (case-insensitive, the fastest search)",
    example: "pizza",
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: "Filter by snippet (case-insensitive)",
    example: "oven",
    required: false,
  })
  @IsOptional()
  @IsString()
  snippet?: string;
}
