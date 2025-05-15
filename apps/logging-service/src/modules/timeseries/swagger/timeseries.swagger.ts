import { HttpStatus } from '@nestjs/common';
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TimeSeriesDto } from '../dto/response';

export function ApiQueryTimeSeries() {
  return applyDecorators(
    ApiOperation({
      summary: 'Query time series data with filtering and aggregation',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Time series data',
      type: [TimeSeriesDto],
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
