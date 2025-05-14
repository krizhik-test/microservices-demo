import { ApiProperty } from "@nestjs/swagger";

export class FileUploadRequestDto {
  @ApiProperty({
    type: "string",
    format: "binary",
    description: "JSON file to upload",
  })
  file: any;
}
