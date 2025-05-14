import { Controller, Post, Body } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { QueryAnalysisResponseDto } from "./dto/response";
import { DebugSearchDto } from "./dto/request";
import { DebugService } from "./debug.service";
import { ApiAnalyzeQuery } from "./swagger";

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
