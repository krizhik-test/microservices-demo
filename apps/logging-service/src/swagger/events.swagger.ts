import { HttpStatus } from "@nestjs/common";
import { ApiDoc } from "@app/shared/swagger";

export function ApiFindAllEvents() {
  return ApiDoc("Query logged events with filtering and pagination", [
    {
      status: HttpStatus.OK,
      description: "List of events with pagination metadata",
      schema: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: { type: "object" },
          },
          pagination: {
            type: "object",
            properties: {
              total: { type: "number" },
              page: { type: "number" },
              limit: { type: "number" },
              pages: { type: "number" },
            },
          },
        },
      },
    },
    { status: HttpStatus.BAD_REQUEST, description: "Bad request" },
  ]);
}

export function ApiFindOneEvent() {
  return ApiDoc("Get a specific event by ID", [
    {
      status: HttpStatus.OK,
      description: "Event details",
      schema: {
        type: "object",
        properties: {
          id: { type: "string" },
          timestamp: { type: "number" },
          service: { type: "string" },
          operation: { type: "string" },
          status: { type: "string", enum: ["success", "error"] },
          data: { type: "object" },
          metadata: { type: "object" },
        },
      },
    },
    { status: HttpStatus.NOT_FOUND, description: "Event not found" },
  ]);
}
