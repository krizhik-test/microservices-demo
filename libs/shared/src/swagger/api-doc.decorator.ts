import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

/**
 * Base function for creating custom Swagger decorators
 * @param summary Operation summary
 * @param responses Array of response configurations
 * @returns Decorator function
 */
export function ApiDoc(summary: string, responses: ApiResponseOptions[]) {
  const responseDecorators = responses.map((response) =>
    ApiResponse({
      status: response.status,
      description: response.description,
      schema: response.schema,
      type: response.type,
    })
  );

  return applyDecorators(ApiOperation({ summary }), ...responseDecorators);
}

/**
 * Interface for API response options
 */
export interface ApiResponseOptions {
  status: number;
  description: string;
  schema?: Record<string, any>;
  type?: any;
}
