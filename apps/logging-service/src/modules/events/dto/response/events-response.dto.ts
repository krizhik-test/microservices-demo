import { ApiProperty } from "@nestjs/swagger";
import { EventStatus } from "@app/shared/interfaces";

export class PaginationDto {
  @ApiProperty({ description: "Total number of records" })
  total: number;

  @ApiProperty({ description: "Current page number" })
  page: number;

  @ApiProperty({ description: "Number of records per page" })
  limit: number;

  @ApiProperty({ description: "Total number of pages" })
  pages: number;
}

export class EventDto {
  @ApiProperty({ description: "Unique identifier of the event" })
  id: string;

  @ApiProperty({ description: "Timestamp when the event occurred" })
  timestamp: number;

  @ApiProperty({ description: "Type of the event" })
  type: string;

  @ApiProperty({ description: "Service that generated the event" })
  service: string;

  @ApiProperty({ description: "Operation that was performed" })
  operation: string;

  @ApiProperty({
    description: "Status of the operation",
    enum: EventStatus,
  })
  status: EventStatus;

  @ApiProperty({
    description: "Data associated with the event",
    type: Object,
  })
  data: Record<string, any>;

  @ApiProperty({
    description: "Additional metadata for the event",
    type: Object,
  })
  metadata: Record<string, any>;
}

export class EventsListDto {
  @ApiProperty({
    description: "Array of events",
    type: [EventDto],
  })
  data: EventDto[];

  @ApiProperty({
    description: "Pagination information",
    type: PaginationDto,
  })
  pagination: PaginationDto;
}
