import fs from "node:fs/promises";
import { PDFParse } from "pdf-parse";

export type ExtractedPdfText = {
  text: string;
  pageCount: number;
};

export const extractTextFromPdf = async (filePath: string): Promise<ExtractedPdfText> => {
  const fileBuffer = await fs.readFile(filePath);
  const parser = new PDFParse({ data: new Uint8Array(fileBuffer) });

  try {
    const textResult = await parser.getText();

    return {
      text: textResult.text.trim(),
      pageCount: textResult.total
    };
  } finally {
    await parser.destroy();
  }
};