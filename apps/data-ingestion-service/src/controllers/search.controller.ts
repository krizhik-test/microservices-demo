import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SearchService } from "../services/search.service";
import { SearchDto } from "../dto/request/search.dto";
import { SearchResponseDto } from "../dto/response/search-response.dto";
import { ApiSearch } from "../swagger/search.swagger";

@ApiTags("search")
@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiSearch()
  async search(@Query() searchDto: SearchDto): Promise<SearchResponseDto> {
    return this.searchService.search(searchDto);
  }
}
