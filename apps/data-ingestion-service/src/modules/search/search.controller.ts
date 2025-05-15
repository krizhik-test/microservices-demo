import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchDto } from './dto/request';
import { SearchResponseDto } from './dto/response';
import { ApiSearch } from './swagger';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiSearch()
  async search(@Query() searchDto: SearchDto): Promise<SearchResponseDto> {
    return this.searchService.search(searchDto);
  }
}
