import { HttpStatus } from "@nestjs/common";
import { ApiDoc } from "@app/shared/swagger";

export function ApiFetchData() {
  return ApiDoc("Fetch data from public API and save as JSON file", [
    {
      status: HttpStatus.CREATED,
      description: "Data fetched and saved successfully",
      schema: {
        type: "object",
        properties: {
          filename: { type: "string" },
          size: { type: "number" },
          path: { type: "string" },
          timestamp: { type: "string", format: "date-time" },
        },
      },
    },
    { status: HttpStatus.BAD_REQUEST, description: "Bad request" },
    {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: "Internal server error",
    },
  ]);
}

export function ApiListFiles() {
  return ApiDoc("List all downloaded data files", [
    {
      status: HttpStatus.OK,
      description: "List of downloaded files",
      schema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            filename: { type: "string" },
            size: { type: "number" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
  ]);
}

export function ApiDeleteDownloadedFile() {
  return ApiDoc("Delete a specific downloaded file by filename", [
    {
      status: HttpStatus.OK,
      description: "File deleted successfully",
      schema: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
        },
      },
    },
    { status: HttpStatus.NOT_FOUND, description: "File not found" },
    { status: HttpStatus.BAD_REQUEST, description: "Bad request" },
  ]);
}

export function ApiDeleteAllDownloadedFiles() {
  return ApiDoc("Delete all downloaded files", [
    {
      status: HttpStatus.OK,
      description: "All downloaded files deleted successfully",
      schema: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          count: { type: "number" },
          message: { type: "string" },
        },
      },
    },
    {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: "Internal server error",
    },
  ]);
}
