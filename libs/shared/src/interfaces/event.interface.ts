export interface EventPayload<T = any> {
  id: string;
  timestamp: number;
  service: string;
  operation: string;
  status: "success" | "error";
  data: T;
  metadata?: Record<string, any>;
}

export enum EventType {
  DATA_FETCH = "data_fetch",
  DATA_UPLOAD = "data_upload",
  DATA_SEARCH = "data_search",
  DATA_DELETE = "data_delete",
  SYSTEM = "system",
}

export enum EventStatus {
  SUCCESS = "success",
  ERROR = "error",
}

export enum OperationType {
  SEARCH = "search",
  FETCH_DATA = "fetch_data",
  UPLOAD_FILE = "upload_file",
  PROCESS_FILE = "process_file",
  DELETE_FILE = "delete_file",
  DELETE_ALL_FILES = "delete_all_files",
  DELETE_DOWNLOADED_FILE = "delete_downloaded_file",
  DELETE_ALL_DOWNLOADED_FILES = "delete_all_downloaded_files",
}

export enum ServiceType {
  DATA_INGESTION = "data_ingestion",
  LOGGING = "logging",
}

export interface EventMessage<T = any> {
  type: EventType;
  payload: EventPayload<T>;
}
