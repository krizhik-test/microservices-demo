import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({ description: 'Total number of records' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of records per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  pages: number;
}

export class SearchResponseDto {
  @ApiProperty({
    description: 'Array of search results',
    type: 'array',
    items: {
      type: 'object',
    },
  })
  data: any[];

  @ApiProperty({
    description: 'Pagination information',
    type: PaginationDto,
  })
  pagination: PaginationDto;
}
