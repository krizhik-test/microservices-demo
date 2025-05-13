import {
  TimeSeriesDuplicatePolicies,
  TimeSeriesEncoding,
} from "@redis/time-series";

export interface CreateOptions {
  RETENTION?: number;
  ENCODING?: TimeSeriesEncoding;
  CHUNK_SIZE?: number;
  DUPLICATE_POLICY?: TimeSeriesDuplicatePolicies;
  LABELS?: Record<string, string>;
  IGNORE?: { [key: string]: any };
}

export enum TimeSeriesType {
  API_REQUEST = "api_request",
  EVENT_TRACE = "event_trace",
}

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  DELETE = "DELETE",
}

export enum TimeSeriesEventType {
  PUBLISH = "publish",
  CONSUME = "consume",
}

export enum ApiEndpoint {
  DATA_FETCH = "/data/fetch",
  FILES_UPLOAD = "/files/upload",
  FILES_PROCESS = "/files/process",
  FILES_DOWNLOAD = "/files/download",
  FILES_LIST = "/files",
  DATA_FILES_LIST = "/data/files",
  SEARCH = "/search",
}

export enum AggregationType {
  AVG = "avg",
  SUM = "sum",
  MIN = "min",
  MAX = "max",
  COUNT = "count",
}

export interface TimeSeriesSample {
  timestamp: number;
  value: number;
}

export interface TimeSeriesResult {
  key: string;
  labels: Record<string, string>;
  samples: TimeSeriesSample[];
}
