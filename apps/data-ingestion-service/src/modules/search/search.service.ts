import { Injectable } from '@nestjs/common';
import { EventStatus, EventType, OperationType } from '@app/shared/interfaces';
import { buildSearchCriteria } from '../../utils';
import { EventService } from '../event/event.service';
import { DataService } from '../data/data.service';
import { SearchDto } from './dto/request';

@Injectable()
export class SearchService {
  constructor(
    private readonly dataService: DataService,
    private readonly eventService: EventService,
  ) {}

  async search(searchDto: SearchDto) {
    const startTime = Date.now();
    const { query, title, snippet, page = 1, limit = 10 } = searchDto;

    try {
      const searchCriteria = buildSearchCriteria(query, title, snippet);

      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.dataService.find(searchCriteria, skip, limit),
        this.dataService.count(searchCriteria),
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
        status: EventStatus.SUCCESS,
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
