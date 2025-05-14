import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class DebugSearchDto {
  @ApiPropertyOptional({
    description: "General search query",
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    description: "Search by title",
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: "Search by snippet",
  })
  @IsOptional()
  @IsString()
  snippet?: string;
}
