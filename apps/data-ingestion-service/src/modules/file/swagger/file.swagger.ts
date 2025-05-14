import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiConsumes, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { FileProcessResponseDto, FileUploadResponseDto } from "../dto/response";
import {
  DeleteAllResponseDto,
  DeleteResponseDto,
  FileInfoDto,
} from "../../data/dto/response";
import { ApiFile } from "./api-file.decorator";

export function ApiListUploadedFiles() {
  return applyDecorators(
    ApiOperation({ summary: "List all uploaded JSON files" }),
    ApiResponse({
      status: HttpStatus.OK,
      description: "List of uploaded files",
      type: [FileInfoDto],
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: "Internal server error",
    })
  );
}

export function ApiUploadFile() {
  return applyDecorators(
    ApiOperation({
      summary: "Upload a JSON file and store its data in MongoDB",
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: "File uploaded and data stored successfully",
      type: FileUploadResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: "Bad request or invalid file",
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: "Internal server error",
    }),
    ApiConsumes("multipart/form-data"),
    ApiFile()
  );
}

export function ApiProcessFile() {
  return applyDecorators(
    ApiOperation({
      summary: "Process an existing JSON file and store its data in MongoDB",
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: "File processed and data stored successfully",
      type: FileProcessResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: "Bad request or file not found",
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: "Internal server error",
    })
  );
}

export function ApiDownloadFile() {
  return applyDecorators(
    ApiOperation({ summary: "Download a previously generated JSON file" }),
    ApiResponse({
      status: HttpStatus.OK,
      description: "File stream",
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: "File not found",
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: "Internal server error",
    })
  );
}

export function ApiDeleteFile() {
  return applyDecorators(
    ApiOperation({ summary: "Delete a specific JSON file by filename" }),
    ApiResponse({
      status: HttpStatus.OK,
      description: "File deleted successfully",
      type: DeleteResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: "File not found",
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: "Bad request",
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: "Internal server error",
    })
  );
}

export function ApiDeleteAllFiles() {
  return applyDecorators(
    ApiOperation({ summary: "Delete all JSON files" }),
    ApiResponse({
      status: HttpStatus.OK,
      description: "All files deleted successfully",
      type: DeleteAllResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: "Internal server error",
    })
  );
}
