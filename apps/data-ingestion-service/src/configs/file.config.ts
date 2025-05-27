/**
 * Configuration settings for file operations
 */
export const FileConfig = {
  /**
   * Chunk size (highWaterMark) for file streams in bytes
   *
   * - 64KB (65536): Default Node.js size, good for small files
   * - 256KB (262144): Good balance for most JSON files
   * - 1MB (1048576): Better for very large files when performance is critical
   *
   * Adjust based on expected file sizes and memory constraints
   */
  CHUNK_SIZE: 262144,

  /**
   * Maximum file size for uploads in bytes
   */
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB

  /**
   * Temporary directory for file uploads
   */
  TEMP_UPLOADS_DIR: 'uploads/temp',

  /**
   * Permanent directory for processed files
   */
  UPLOADS_DIR: 'uploads',

  /**
   * Directory for downloaded files
   */
  DOWNLOADS_DIR: 'downloads',
};
