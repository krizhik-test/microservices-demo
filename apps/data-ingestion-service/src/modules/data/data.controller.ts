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
import { DataService } from "./data.service";
import { DataFetchDto } from "./dto/request";
import {
  DataFetchResponseDto,
  DeleteAllResponseDto,
  DeleteResponseDto,
  FileInfoDto,
} from "./dto/response";
import { FileNameParamDto } from "../../dto/params";
import {
  ApiFetchData,
  ApiListFiles,
  ApiDeleteDownloadedFile,
  ApiDeleteAllDownloadedFiles,
} from "./swagger";

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
    @Param() fileNameParamDto: FileNameParamDto
  ): Promise<DeleteResponseDto> {
    return this.dataService.deleteDownloadedFile(fileNameParamDto.filename);
  }

  @Delete("files")
  @HttpCode(HttpStatus.OK)
  @ApiDeleteAllDownloadedFiles()
  async deleteAllDownloadedFiles(): Promise<DeleteAllResponseDto> {
    return this.dataService.deleteAllDownloadedFiles();
  }
}
