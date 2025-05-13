import { HttpStatus } from "@nestjs/common";
import { ApiDoc } from "@app/shared/swagger";

export function ApiSearch() {
  return ApiDoc("Search stored data with pagination and filtering", [
    {
      status: HttpStatus.OK,
      description: "Search results with pagination metadata",
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
