import { HttpStatus } from '@nestjs/common';
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EventDto, EventsListDto } from '../dto/response';

export function ApiFindAllEvents() {
  return applyDecorators(
    ApiOperation({
      summary: 'Query logged events with filtering and pagination',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'List of events with pagination metadata',
      type: EventsListDto,
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

export function ApiFindOneEvent() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a specific event by ID' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Event details',
      type: EventDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Event not found',
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Internal server error',
    }),
  );
}
