import { Controller, Get, Query, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { EventsService } from "../services/events.service";
import { EventsQueryDto } from "../dto/request/events-query.dto";
import { ApiFindAllEvents, ApiFindOneEvent } from "../swagger/events.swagger";
import { EventDto, EventsListDto } from "../dto/response/events-response.dto";

@ApiTags("events")
@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiFindAllEvents()
  async findAll(@Query() query: EventsQueryDto): Promise<EventsListDto> {
    return this.eventsService.findAll(query);
  }

  @Get(":id")
  @ApiFindOneEvent()
  async findOne(@Param("id") id: string): Promise<EventDto> {
    return this.eventsService.findOne(id);
  }
}
