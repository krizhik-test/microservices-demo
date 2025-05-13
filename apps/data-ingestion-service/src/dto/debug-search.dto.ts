import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class DebugSearchDto {
  @ApiProperty({
    description: "General search query",
    required: false,
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({
    description: "Search by title",
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: "Search by snippet",
    required: false,
  })
  @IsOptional()
  @IsString()
  snippet?: string;
}
