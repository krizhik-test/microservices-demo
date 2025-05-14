import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { FileService } from "../services/file.service";
import { FileUploadDto } from "../dto/request/file-upload.dto";

import {
  ApiListUploadedFiles,
  ApiUploadFile,
  ApiProcessFile,
  ApiDownloadFile,
  ApiDeleteFile,
  ApiDeleteAllFiles,
} from "../swagger/file.swagger";
import {
  DeleteAllResponseDto,
  DeleteResponseDto,
  FileInfoDto,
} from "../dto/response/data-response.dto";
import {
  FileProcessResponseDto,
  FileUploadResponseDto,
} from "../dto/response/file-response.dto";

@ApiTags("files")
@Controller("files")
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get()
  @ApiListUploadedFiles()
  async listFiles(): Promise<FileInfoDto[]> {
    return this.fileService.listUploadedFiles();
  }

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  @ApiUploadFile()
  async uploadFile(
    @UploadedFile() file: Express.Multer.File
  ): Promise<FileUploadResponseDto> {
    return this.fileService.processUploadedFile(file);
  }

  @Post("process")
  @ApiProcessFile()
  async processFile(
    @Body() fileUploadDto: FileUploadDto
  ): Promise<FileProcessResponseDto> {
    return this.fileService.processExistingFile(fileUploadDto.filename);
  }

  @Get("download/:filename")
  @ApiDownloadFile()
  async downloadFile(
    @Param("filename") filename: string,
    @Res() res: Response
  ): Promise<void> {
    return this.fileService.streamFileToResponse(filename, res);
  }

  @Delete(":filename")
  @ApiDeleteFile()
  async deleteFile(
    @Param("filename") filename: string
  ): Promise<DeleteResponseDto> {
    return this.fileService.deleteFile(filename);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiDeleteAllFiles()
  async deleteAllFiles(): Promise<DeleteAllResponseDto> {
    return this.fileService.deleteAllFiles();
  }
}
