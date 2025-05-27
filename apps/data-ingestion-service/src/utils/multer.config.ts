import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { BadRequestException } from '@nestjs/common';
import { FileConfig } from '../configs/file.config';

// Create temp uploads directory if it doesn't exist
const tempUploadsDir = path.join(process.cwd(), FileConfig.TEMP_UPLOADS_DIR);
if (!fs.existsSync(tempUploadsDir)) {
  fs.mkdirSync(tempUploadsDir, { recursive: true });
}

export const multerDiskStorage = {
  storage: diskStorage({
    destination: tempUploadsDir,
    filename: (req, file, callback) => {
      // Generate a unique filename with timestamp
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      const filename = `${path.basename(
        file.originalname,
        ext,
      )}-${uniqueSuffix}${ext}`;
      callback(null, filename);
    },
  }),
  fileFilter: (req, file, callback) => {
    // Only accept JSON files
    if (!file.originalname.match(/\.(json)$/)) {
      return callback(
        new BadRequestException('Only JSON files are allowed'),
        false,
      );
    }
    callback(null, true);
  },
  limits: {
    fileSize: FileConfig.MAX_FILE_SIZE,
  },
};
