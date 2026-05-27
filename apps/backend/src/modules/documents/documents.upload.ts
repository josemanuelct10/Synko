import multer from "multer";

import { env } from "../../config/env.js";

const maxFileSizeBytes = env.MAX_UPLOAD_SIZE_MB * 1024 * 1024;

export const uploadDocumentMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxFileSizeBytes
  },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype !== "application/pdf") {
      return callback(new Error("Only PDF files are allowed"));
    }

    return callback(null, true);
  }
});