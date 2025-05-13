import { Controller, Get, Query, UseInterceptors } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SearchService } from "../services/search.service";
import { SearchDto } from "../dto/search.dto";
import { ApiLogInterceptor } from "../decorators/api-log.interceptor";
import { ApiSearch } from "../swagger/search.swagger";

@ApiTags('search')
@Controller('search')
@UseInterceptors(ApiLogInterceptor)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiSearch()
  async search(@Query() searchDto: SearchDto) {
    return this.searchService.search(searchDto);
  }
}
