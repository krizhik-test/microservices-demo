import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsInt, Min } from "class-validator";

export class DataFetchDto {
  @ApiProperty({
    description: "Query string for the public API",
    example: "pizza",
  })
  @IsString()
  query: string;

  @ApiProperty({
    description: "Number of results to fetch",
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiProperty({
    description: "Filename to save the data (without extension)",
    example: "wiki-data",
    required: false,
  })
  @IsOptional()
  @IsString()
  filename?: string;
}
