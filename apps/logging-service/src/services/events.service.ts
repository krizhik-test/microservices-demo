import { Injectable, NotFoundException } from "@nestjs/common";
import { Filter } from "mongodb";
import { EventsQueryDto } from "../dto/request";
import { EventsRepository } from "../repositories";
import { EventDocument } from "../interfaces";
import { EventDto, EventsListDto } from "../dto/response";

@Injectable()
export class EventsService {
  constructor(private readonly eventsRepository: EventsRepository) {}

  async findAll(query: EventsQueryDto): Promise<EventsListDto> {
    const {
      type,
      startDate,
      endDate,
      operation,
      status,
      page = 1,
      limit = 10,
    } = query;

    const criteria: Filter<EventDocument> = {};

    if (type) {
      criteria["type"] = type;
    }

    if (startDate || endDate) {
      criteria["payload.timestamp"] = {};

      if (startDate) {
        criteria["payload.timestamp"]["$gte"] = new Date(startDate).getTime();
      }

      if (endDate) {
        criteria["payload.timestamp"]["$lte"] = new Date(endDate).getTime();
      }
    }

    if (operation) {
      criteria["payload.operation"] = operation;
    }

    if (status) {
      criteria["payload.status"] = status;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.eventsRepository.find(criteria, skip, limit),
      this.eventsRepository.count(criteria),
    ]);

    const events = data.map((event) => {
      return {
        id: event._id.toString(),
        type: event.type,
        timestamp: event.payload.timestamp,
        service: event.payload.service,
        operation: event.payload.operation,
        status: event.payload.status,
        data: event.payload.data,
        metadata: event.payload.metadata,
      };
    });

    return {
      data: events,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<EventDto> {
    const event = await this.eventsRepository.findById(id);

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return {
      id: event._id.toString(),
      type: event.type,
      timestamp: event.payload.timestamp,
      service: event.payload.service,
      operation: event.payload.operation,
      status: event.payload.status,
      data: event.payload.data,
      metadata: event.payload.metadata,
    };
  }
}
