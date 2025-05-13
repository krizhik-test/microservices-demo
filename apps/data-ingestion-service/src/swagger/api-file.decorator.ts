import { applyDecorators } from "@nestjs/common";
import { ApiBody } from "@nestjs/swagger";

export function ApiFile() {
  return applyDecorators(
    ApiBody({
      schema: {
        type: "object",
        properties: {
          file: {
            type: "string",
            format: "binary",
            description: "JSON file to upload",
          },
        },
        required: ["file"],
      },
    })
  );
}
