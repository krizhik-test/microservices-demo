import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class FileNameParamDto {
  @ApiProperty({
    description: "The name of the file",
    example: "data.json",
  })
  @IsNotEmpty()
  @IsString()
  filename: string;
}
