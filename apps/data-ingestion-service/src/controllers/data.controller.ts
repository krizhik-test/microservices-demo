import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DataService } from "../services/data.service";
import { DataFetchDto } from "../dto/request/data-fetch.dto";
import {
  DataFetchResponseDto,
  DeleteAllResponseDto,
  DeleteResponseDto,
  FileInfoDto,
} from "../dto/response/data-response.dto";
import {
  ApiFetchData,
  ApiListFiles,
  ApiDeleteDownloadedFile,
  ApiDeleteAllDownloadedFiles,
} from "../swagger/data.swagger";

@ApiTags("data")
@Controller("data")
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Post("fetch")
  @ApiFetchData()
  async fetchData(
    @Body() dataFetchDto: DataFetchDto
  ): Promise<DataFetchResponseDto> {
    return this.dataService.fetchData(dataFetchDto);
  }

  @Get("files")
  @ApiListFiles()
  async listFiles(): Promise<FileInfoDto[]> {
    return this.dataService.listFiles();
  }

  @Delete("files/:filename")
  @ApiDeleteDownloadedFile()
  async deleteDownloadedFile(
    @Param("filename") filename: string
  ): Promise<DeleteResponseDto> {
    return this.dataService.deleteDownloadedFile(filename);
  }

  @Delete("files")
  @HttpCode(HttpStatus.OK)
  @ApiDeleteAllDownloadedFiles()
  async deleteAllDownloadedFiles(): Promise<DeleteAllResponseDto> {
    return this.dataService.deleteAllDownloadedFiles();
  }
}
