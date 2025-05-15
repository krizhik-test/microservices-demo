import { HttpStatus } from '@nestjs/common';
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchResponseDto } from '../dto/response/search-response.dto';

export function ApiSearch() {
  return applyDecorators(
    ApiOperation({
      summary: 'Search stored data with pagination and filtering',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Search results with pagination metadata',
      type: SearchResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Bad request',
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Internal server error',
    }),
  );
}
