import { Controller, Get, Query, Param, UseInterceptors } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { EventsService } from "../services/events.service";
import { EventsQueryDto } from "../dto/events-query.dto";
import { ApiLogInterceptor } from "../decorators/api-log.interceptor";
import { ApiFindAllEvents, ApiFindOneEvent } from "../swagger/events.swagger";

@ApiTags("events")
@Controller("events")
@UseInterceptors(ApiLogInterceptor)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiFindAllEvents()
  async findAll(@Query() query: EventsQueryDto) {
    return this.eventsService.findAll(query);
  }

  @Get(":id")
  @ApiFindOneEvent()
  async findOne(@Param("id") id: string) {
    return this.eventsService.findOne(id);
  }
}
