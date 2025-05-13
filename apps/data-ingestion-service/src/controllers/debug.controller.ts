import { Controller, Post, Body, UseInterceptors } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DebugSearchDto } from "../dto/debug-search.dto";
import { DataRepository } from "../repositories/data.repository";
import { ApiLogInterceptor } from "../decorators/api-log.interceptor";

@ApiTags("debug")
@Controller("debug")
@UseInterceptors(ApiLogInterceptor)
export class DebugController {
  constructor(private readonly dataRepository: DataRepository) {}

  @Post("analyze-query")
  async analyzeQuery(@Body() searchDto: DebugSearchDto) {
    const { query, title, snippet } = searchDto;

    const searchCriteria: any = {};

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

    const analysis = await this.dataRepository.analyzeQuery(searchCriteria);

    return {
      query: searchCriteria,
      analysis,
    };
  }
}
