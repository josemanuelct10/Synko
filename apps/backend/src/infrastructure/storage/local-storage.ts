import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

import { env } from "../../config/env.js";

export const ensureUploadsDirectory = async (): Promise<string> => {
  const uploadsPath = path.resolve(process.cwd(), "../../", env.UPLOADS_DIR, "documents");

  await fs.mkdir(uploadsPath, { recursive: true });

  return uploadsPath;
};

export const createStoredFileName = (originalName: string): string => {
  const extension = path.extname(originalName).toLowerCase();
  const id = crypto.randomUUID();

  return `${id}${extension}`;
};