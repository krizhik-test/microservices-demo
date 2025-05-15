import { ApiProperty } from '@nestjs/swagger';

export class DataFetchResponseDto {
  @ApiProperty({ description: 'Name of the downloaded file' })
  filename: string;

  @ApiProperty({ description: 'Size of the file in bytes' })
  size: number;

  @ApiProperty({ description: 'Path where the file is stored' })
  path: string;

  @ApiProperty({
    description: 'Timestamp when the file was created',
    format: 'date-time',
  })
  timestamp: string;
}

export class FileInfoDto {
  @ApiProperty({ description: 'Name of the file' })
  filename: string;

  @ApiProperty({ description: 'Size of the file in bytes' })
  size: number;

  @ApiProperty({
    description: 'Timestamp when the file was created',
    format: 'date-time',
  })
  createdAt: string;
}

export class DeleteResponseDto {
  @ApiProperty({ description: 'Whether the operation was successful' })
  success: boolean;

  @ApiProperty({ description: 'Message describing the result' })
  message: string;
}

export class DeleteAllResponseDto {
  @ApiProperty({ description: 'Whether the operation was successful' })
  success: boolean;

  @ApiProperty({ description: 'Number of files deleted' })
  count: number;

  @ApiProperty({ description: 'Message describing the result' })
  message: string;
}
