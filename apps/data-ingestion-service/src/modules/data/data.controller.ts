import { Response } from 'express';
import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataService } from './data.service';
import { DataFetchDto } from './dto/request';
import {
  DataFetchResponseDto,
  DeleteAllResponseDto,
  DeleteResponseDto,
  FileInfoDto,
} from './dto/response';
import { FileNameParamDto } from '../../dto/params';
import {
  ApiFetchData,
  ApiListFiles,
  ApiDeleteDownloadedFile,
  ApiDeleteAllDownloadedFiles,
  ApiDownloadFile,
} from './swagger';

@ApiTags('data')
@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Post('fetch')
  @ApiFetchData()
  async fetchData(
    @Body() dataFetchDto: DataFetchDto,
  ): Promise<DataFetchResponseDto> {
    return this.dataService.fetchData(dataFetchDto);
  }

  @Get('files')
  @ApiListFiles()
  async listFiles(): Promise<FileInfoDto[]> {
    return this.dataService.listFiles();
  }

  @Get('files/:filename')
  @ApiDownloadFile()
  async downloadFile(
    @Param() fileNameParamDto: FileNameParamDto,
    @Res() res: Response,
  ): Promise<void> {
    return this.dataService.streamFileToResponse(
      fileNameParamDto.filename,
      res,
    );
  }

  @Delete('files/:filename')
  @ApiDeleteDownloadedFile()
  async deleteDownloadedFile(
    @Param() fileNameParamDto: FileNameParamDto,
  ): Promise<DeleteResponseDto> {
    return this.dataService.deleteDownloadedFile(fileNameParamDto.filename);
  }

  @Delete('files')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteAllDownloadedFiles()
  async deleteAllDownloadedFiles(): Promise<DeleteAllResponseDto> {
    return this.dataService.deleteAllDownloadedFiles();
  }
}
