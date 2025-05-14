import { HttpStatus } from "@nestjs/common";
import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import {
  DataFetchResponseDto,
  DeleteAllResponseDto,
  DeleteResponseDto,
  FileInfoDto,
} from "../dto/response/data-response.dto";

export function ApiFetchData() {
  return applyDecorators(
    ApiOperation({
      summary: "Fetch data from public API and save as JSON file",
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: "Data fetched and saved successfully",
      type: DataFetchResponseDto,
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

export function ApiListFiles() {
  return applyDecorators(
    ApiOperation({ summary: "List all downloaded data files" }),
    ApiResponse({
      status: HttpStatus.OK,
      description: "List of downloaded files",
      type: [FileInfoDto],
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: "Internal server error",
    })
  );
}

export function ApiDeleteDownloadedFile() {
  return applyDecorators(
    ApiOperation({ summary: "Delete a specific downloaded file by filename" }),
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

export function ApiDeleteAllDownloadedFiles() {
  return applyDecorators(
    ApiOperation({ summary: "Delete all downloaded files" }),
    ApiResponse({
      status: HttpStatus.OK,
      description: "All downloaded files deleted successfully",
      type: DeleteAllResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: "Internal server error",
    })
  );
}
