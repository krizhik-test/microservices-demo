export interface DataItem {
  /** Unique identifier (MongoDB _id) */
  _id?: string;
  /** Title of the data item */
  title: string;
  /** Text snippet or content */
  snippet: string;
  /** Source of the data (e.g., 'wikipedia') */
  source: string;
  /** Timestamp when the item was imported */
  importedAt: Date;
  /** Page ID (for Wikipedia items) */
  pageid?: number;
  /** Size of the content in bytes (for Wikipedia items) */
  size?: number;
  /** Word count (for Wikipedia items) */
  wordcount?: number;
  /** Namespace (for Wikipedia items) */
  ns?: number;
  /** Any additional fields that might be present */
  [key: string]: any;
}
