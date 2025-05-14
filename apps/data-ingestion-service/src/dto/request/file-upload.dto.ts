import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

export class FileUploadDto {
  @ApiProperty({
    description: "Name of the file to process",
    example: "wiki-data.json",
  })
  @IsString()
  @IsNotEmpty()
  filename: string;
}
