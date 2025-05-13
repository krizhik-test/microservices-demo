import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  HttpCode,
  UseInterceptors,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DataService } from "../services/data.service";
import { DataFetchDto } from "../dto/data-fetch.dto";
import { ApiLogInterceptor } from "../decorators/api-log.interceptor";
import {
  ApiFetchData,
  ApiListFiles,
  ApiDeleteDownloadedFile,
  ApiDeleteAllDownloadedFiles,
} from "../swagger/data.swagger";

@ApiTags("data")
@Controller("data")
@UseInterceptors(ApiLogInterceptor)
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Post("fetch")
  @ApiFetchData()
  async fetchData(@Body() dataFetchDto: DataFetchDto) {
    return this.dataService.fetchData(dataFetchDto);
  }

  @Get("files")
  @ApiListFiles()
  async listFiles() {
    return this.dataService.listFiles();
  }

  @Delete("files/:filename")
  @ApiDeleteDownloadedFile()
  async deleteDownloadedFile(@Param("filename") filename: string) {
    return this.dataService.deleteDownloadedFile(filename);
  }

  @Delete("files")
  @HttpCode(HttpStatus.OK)
  @ApiDeleteAllDownloadedFiles()
  async deleteAllDownloadedFiles() {
    return this.dataService.deleteAllDownloadedFiles();
  }
}
