import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsInt, Min } from "class-validator";

export class DataFetchDto {
  @ApiProperty({
    description: "Query string for the public API",
    example: "pizza",
  })
  @IsString()
  query: string;

  @ApiPropertyOptional({
    description: "Number of results to fetch",
    example: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    description: "Filename to save the data (without extension)",
    example: "wiki-data",
  })
  @IsOptional()
  @IsString()
  filename?: string;
}
