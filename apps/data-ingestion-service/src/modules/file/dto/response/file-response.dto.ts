import { ApiProperty } from "@nestjs/swagger";

export class FileUploadResponseDto {
  @ApiProperty({ description: "Name of the uploaded file" })
  filename: string;

  @ApiProperty({ description: "Number of records processed from the file" })
  recordsProcessed: number;

  @ApiProperty({
    description: "Timestamp when the file was processed",
    format: "date-time",
  })
  timestamp: string;
}

export class FileProcessResponseDto {
  @ApiProperty({ description: "Name of the processed file" })
  filename: string;

  @ApiProperty({ description: "Number of records processed from the file" })
  recordsProcessed: number;

  @ApiProperty({
    description: "Timestamp when the file was processed",
    format: "date-time",
  })
  timestamp: string;
}
