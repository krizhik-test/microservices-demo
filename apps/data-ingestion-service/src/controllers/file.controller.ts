import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  Get,
  Param,
  Res,
  UploadedFile,
  Delete,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { FileService } from "../services/file.service";
import { FileUploadDto } from "../dto/file-upload.dto";
import { ApiLogInterceptor } from "../decorators/api-log.interceptor";
import {
  ApiListUploadedFiles,
  ApiUploadFile,
  ApiProcessFile,
  ApiDownloadFile,
  ApiDeleteFile,
  ApiDeleteAllFiles,
} from "../swagger/file.swagger";

@ApiTags("files")
@Controller("files")
@UseInterceptors(ApiLogInterceptor)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get()
  @ApiListUploadedFiles()
  async listFiles() {
    return this.fileService.listUploadedFiles();
  }

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  @ApiUploadFile()
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.fileService.processUploadedFile(file);
  }

  @Post("process")
  @ApiProcessFile()
  async processFile(@Body() fileUploadDto: FileUploadDto) {
    return this.fileService.processExistingFile(fileUploadDto.filename);
  }

  @Get("download/:filename")
  @ApiDownloadFile()
  async downloadFile(
    @Param("filename") filename: string,
    @Res() res: Response
  ) {
    return this.fileService.streamFileToResponse(filename, res);
  }

  @Delete(":filename")
  @ApiDeleteFile()
  async deleteFile(@Param("filename") filename: string) {
    return this.fileService.deleteFile(filename);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiDeleteAllFiles()
  async deleteAllFiles() {
    return this.fileService.deleteAllFiles();
  }
}
