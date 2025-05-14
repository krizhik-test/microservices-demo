import { Injectable } from "@nestjs/common";
import { DebugSearchDto } from "../dto/request";
import { DataRepository } from "../repositories";
import { buildSearchCriteria } from "../utils";

@Injectable()
export class DebugService {
  constructor(private readonly dataRepository: DataRepository) {}

  async analyzeQuery(searchDto: DebugSearchDto) {
    const { query, title, snippet } = searchDto;

    const searchCriteria = buildSearchCriteria(query, title, snippet);

    const analysis = await this.dataRepository.analyzeQuery(searchCriteria);

    return {
      query: searchCriteria,
      analysis,
    };
  }
}
