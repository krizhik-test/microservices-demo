import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { RedisTimeSeriesService } from "../database/redis-timeseries.service";

/**
 * Factory function to create an ApiLogInterceptor with a specific service name
 * @param serviceName The name of the service to use in logs
 * @returns A new ApiLogInterceptor class configured with the specified service name
 */
export function ApiLogInterceptorFactory(serviceName: string) {
  @Injectable()
  class ApiLogInterceptor implements NestInterceptor {
    constructor(public readonly redisTimeSeriesService: RedisTimeSeriesService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const request = context.switchToHttp().getRequest();
      const { method, url } = request;
      const startTime = Date.now();

      return next.handle().pipe(
        tap({
          next: (data) => this.logSuccess(method, url, startTime, data),
          error: (error) => this.logError(method, url, startTime, error),
        })
      );
    }

    public logSuccess(
      method: string,
      url: string,
      startTime: number,
      data: any
    ): void {
      const executionTime = Date.now() - startTime;
      this.redisTimeSeriesService.logApiRequest(
        serviceName,
        url,
        method,
        HttpStatus.OK,
        executionTime
      );
    }

    public logError(
      method: string,
      url: string,
      startTime: number,
      error: any
    ): void {
      const executionTime = Date.now() - startTime;
      this.redisTimeSeriesService.logApiRequest(
        serviceName,
        url,
        method,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        executionTime
      );
    }
  }

  return ApiLogInterceptor;
}
