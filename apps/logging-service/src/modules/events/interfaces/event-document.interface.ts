import type {
  EventStatus,
  EventType,
  OperationType,
} from '@app/shared/interfaces';

export interface EventDocument {
  /** MongoDB document ID */
  _id?: string;
  /** Event type (e.g., data_fetch, data_search) */
  type: EventType;
  /** Event payload containing details */
  payload: {
    /** Unique event ID */
    id: string;
    /** Timestamp when the event occurred */
    timestamp: number;
    /** Service that generated the event */
    service: string;
    /** Operation type */
    operation: OperationType;
    /** Status of the operation (success or error) */
    status: EventStatus;
    /** Event-specific data */
    data: Record<string, any>;
    /** Additional metadata */
    metadata?: Record<string, any>;
  };
}
