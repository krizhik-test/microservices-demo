import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiProduces } from '@nestjs/swagger';

export function ApiGenerateReport() {
  return applyDecorators(
    ApiOperation({
      summary: 'Generate a PDF report with charts based on time series data',
      description:
        'Creates a PDF report with time series data visualization. Uses the same query parameters as the timeseries endpoint.',
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'PDF report stream' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Internal server error',
    }),

    ApiProduces('application/pdf'),
  );
}
