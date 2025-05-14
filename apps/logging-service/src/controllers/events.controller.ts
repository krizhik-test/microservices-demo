import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { EventsService } from "../services";
import { EventsQueryDto } from "../dto/request";
import { EventDto, EventsListDto } from "../dto/response";
import { EventIdParamDto } from "../dto/params";
import { ApiFindAllEvents, ApiFindOneEvent } from "../swagger";

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
  async findOne(@Param() params: EventIdParamDto): Promise<EventDto> {
    return this.eventsService.findOne(params.id);
  }
}
