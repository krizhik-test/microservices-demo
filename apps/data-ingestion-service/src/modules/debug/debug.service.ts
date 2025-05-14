import { Injectable } from "@nestjs/common";
import { DebugSearchDto } from "./dto/request";
import { DataService } from "../data/data.service";
import { buildSearchCriteria } from "../../utils";

@Injectable()
export class DebugService {
  constructor(private readonly dataService: DataService) {}

  async analyzeQuery(searchDto: DebugSearchDto) {
    const { query, title, snippet } = searchDto;

    const searchCriteria = buildSearchCriteria(query, title, snippet);

    const analysis = await this.dataService.analyzeQuery(searchCriteria);

    return {
      query: searchCriteria,
      analysis,
    };
  }
}
