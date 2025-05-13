import { HttpStatus } from "@nestjs/common";
import { ApiDoc } from "@app/shared/swagger";

export function ApiQueryTimeSeries() {
  return ApiDoc("Query time series data with filtering and aggregation", [
    {
      status: HttpStatus.OK,
      description: "Time series data",
      schema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            key: { type: "string" },
            labels: { type: "object" },
            data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  timestamp: { type: "number" },
                  value: { type: "number" },
                },
              },
            },
          },
        },
      },
    },
    { status: HttpStatus.BAD_REQUEST, description: "Bad request" },
  ]);
}
