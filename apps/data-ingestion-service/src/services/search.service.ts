import { Injectable } from "@nestjs/common";
import { Filter } from "mongodb";
import { EventStatus, EventType, OperationType } from "@app/shared/interfaces";
import { SearchDto } from "../dto/request/search.dto";
import { DataRepository } from "../repositories/data.repository";
import { EventService } from "./event.service";
import { DataItem } from "../interfaces/data-item.interface";

@Injectable()
export class SearchService {
  constructor(
    private readonly dataRepository: DataRepository,
    private readonly eventService: EventService
  ) {}

  async search(searchDto: SearchDto) {
    const startTime = Date.now();
    const { query, title, snippet, page = 1, limit = 10 } = searchDto;

    try {
      const searchCriteria: Filter<DataItem> = {};

      if (query) {
        searchCriteria.$or = [
          { title: { $regex: query, $options: "i" } },
          { snippet: { $regex: query, $options: "i" } },
        ];
      } else {
        if (title && snippet) {
          searchCriteria.$and = [
            { title: { $regex: title, $options: "i" } },
            { snippet: { $regex: snippet, $options: "i" } },
          ];
        } else if (title) {
          searchCriteria.$text = { $search: title };
        } else if (snippet) {
          searchCriteria.snippet = { $regex: snippet, $options: "i" };
        }
      }

      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.dataRepository.find(searchCriteria, skip, limit),
        this.dataRepository.count(searchCriteria),
      ]);

      const result = {
        data,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };

      await this.eventService.publishEvent(EventType.DATA_SEARCH, {
        operation: OperationType.SEARCH,
        status: "success",
        data: {
          query,
          title,
          snippet,
          page,
          limit,
          resultsCount: data.length,
          totalCount: total,
        },
        metadata: {
          executionTime: Date.now() - startTime,
        },
      });

      return result;
    } catch (error) {
      await this.eventService.publishEvent(EventType.DATA_SEARCH, {
        operation: OperationType.SEARCH,
        status: EventStatus.ERROR,
        data: {
          query,
          title,
          snippet,
          page,
          limit,
          error: error.message,
        },
        metadata: {
          executionTime: Date.now() - startTime,
        },
      });

      throw error;
    }
  }
}
