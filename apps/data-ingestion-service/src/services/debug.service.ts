import { Injectable } from "@nestjs/common";
import { Filter } from "mongodb";
import { DataRepository } from "../repositories/data.repository";
import { DebugSearchDto } from "../dto/request/debug-search.dto";
import { DataItem } from "../interfaces/data-item.interface";

@Injectable()
export class DebugService {
  constructor(private readonly dataRepository: DataRepository) {}

  async analyzeQuery(searchDto: DebugSearchDto) {
    const { query, title, snippet } = searchDto;

    const searchCriteria: Filter<DataItem> = {};

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
