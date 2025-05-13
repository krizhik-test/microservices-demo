import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiConsumes } from "@nestjs/swagger";
import { ApiDoc } from "@app/shared/swagger";
import { ApiFile } from "./api-file.decorator";

export function ApiListUploadedFiles() {
  return ApiDoc("List all uploaded JSON files", [
    {
      status: HttpStatus.OK,
      description: "List of uploaded files",
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

export function ApiUploadFile() {
  return applyDecorators(
    ApiDoc("Upload a JSON file and store its data in MongoDB", [
      {
        status: HttpStatus.CREATED,
        description: "File uploaded and data stored successfully",
        schema: {
          type: "object",
          properties: {
            filename: { type: "string" },
            recordsProcessed: { type: "number" },
            timestamp: { type: "string", format: "date-time" },
          },
        },
      },
      {
        status: HttpStatus.BAD_REQUEST,
        description: "Bad request or invalid file",
      },
      {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: "Internal server error",
      },
    ]),
    ApiConsumes("multipart/form-data"),
    ApiFile()
  );
}

export function ApiProcessFile() {
  return ApiDoc("Process an existing JSON file and store its data in MongoDB", [
    {
      status: HttpStatus.CREATED,
      description: "File processed and data stored successfully",
      schema: {
        type: "object",
        properties: {
          filename: { type: "string" },
          recordsProcessed: { type: "number" },
          timestamp: { type: "string", format: "date-time" },
        },
      },
    },
    {
      status: HttpStatus.BAD_REQUEST,
      description: "Bad request or file not found",
    },
    {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: "Internal server error",
    },
  ]);
}

export function ApiDownloadFile() {
  return ApiDoc("Download a previously generated JSON file", [
    { status: HttpStatus.OK, description: "File stream" },
    { status: HttpStatus.NOT_FOUND, description: "File not found" },
  ]);
}

export function ApiDeleteFile() {
  return ApiDoc("Delete a specific JSON file by filename", [
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

export function ApiDeleteAllFiles() {
  return ApiDoc("Delete all JSON files", [
    {
      status: HttpStatus.OK,
      description: "All files deleted successfully",
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
