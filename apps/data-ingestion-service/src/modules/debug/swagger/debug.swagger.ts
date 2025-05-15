import { HttpStatus } from '@nestjs/common';
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QueryAnalysisResponseDto } from '../dto/response';

export function ApiAnalyzeQuery() {
  return applyDecorators(
    ApiOperation({
      summary: 'Analyze a search query and return MongoDB query details',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Query analysis results',
      type: QueryAnalysisResponseDto,
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
