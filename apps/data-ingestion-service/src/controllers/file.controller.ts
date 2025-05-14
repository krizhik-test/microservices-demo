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
import { FileService } from "../services";
import { FileUploadDto } from "../dto/request";
import { FileNameParamDto } from "../dto/params";
import {
  DeleteAllResponseDto,
  DeleteResponseDto,
  FileInfoDto,
  FileProcessResponseDto,
  FileUploadResponseDto,
} from "../dto/response";
import {
  ApiListUploadedFiles,
  ApiUploadFile,
  ApiProcessFile,
  ApiDownloadFile,
  ApiDeleteFile,
  ApiDeleteAllFiles,
} from "../swagger";

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
    @Param() fileNameParamDto: FileNameParamDto,
    @Res() res: Response
  ): Promise<void> {
    return this.fileService.streamFileToResponse(
      fileNameParamDto.filename,
      res
    );
  }

  @Delete(":filename")
  @ApiDeleteFile()
  async deleteFile(
    @Param() fileNameParamDto: FileNameParamDto
  ): Promise<DeleteResponseDto> {
    return this.fileService.deleteFile(fileNameParamDto.filename);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiDeleteAllFiles()
  async deleteAllFiles(): Promise<DeleteAllResponseDto> {
    return this.fileService.deleteAllFiles();
  }
}
