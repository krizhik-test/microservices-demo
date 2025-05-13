import { Injectable, NotFoundException } from "@nestjs/common";
import { Filter } from "mongodb";
import { EventsQueryDto } from "../dto/events-query.dto";
import { EventsRepository } from "../repositories/events.repository";
import { EventDocument } from "../interfaces/event-document.interface";

@Injectable()
export class EventsService {
  constructor(private readonly eventsRepository: EventsRepository) {}

  async findAll(
    query: EventsQueryDto
  ): Promise<{
    data: EventDocument[];
    pagination: { total: number; page: number; limit: number; pages: number };
  }> {
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

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<EventDocument> {
    const event = await this.eventsRepository.findById(id);

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }
}
