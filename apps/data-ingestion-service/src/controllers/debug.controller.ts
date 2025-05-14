import { Controller, Post, Body } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Filter } from "mongodb";
import { DebugSearchDto } from "../dto/request/debug-search.dto";
import { ApiAnalyzeQuery } from "../swagger/debug.swagger";
import { DebugService } from "../services/debug.service";
import { DataItem } from "../interfaces/data-item.interface";
import { QueryAnalysisResponseDto } from "../dto/response/query-analysis.dto";

@ApiTags("debug")
@Controller("debug")
export class DebugController {
  constructor(private readonly debugService: DebugService) {}

  @Post("analyze-query")
  @ApiAnalyzeQuery()
  async analyzeQuery(
    @Body() searchDto: DebugSearchDto
  ): Promise<QueryAnalysisResponseDto> {
    return this.debugService.analyzeQuery(searchDto);
  }
}
