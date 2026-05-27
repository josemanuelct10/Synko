export type DocumentChunkInput = {
    chunkIndex: number;
    content: string;
    pageNumber: number | null;
    tokenCount: number;
}

const DEFAULT_CHUNK_SIZE = 1200;
const DEFAULT_CHUNK_OVERLAP = 200;

const normalizeText = (text: string): string => {
    return text
        .replace(/\r/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/[ \t]{2,}/g, " ")
        .trim();
};

const estimateTokenCount = (text: string): number => {
    return Math.ceil(text.length / 4);
};

export const splitTextIntoChunks = (rawText: string, chunkSize: number = DEFAULT_CHUNK_SIZE, chunkOverlap: number = DEFAULT_CHUNK_OVERLAP): DocumentChunkInput[] => {
    const text = normalizeText(rawText);

    if (!text) return [];

    const chunks: DocumentChunkInput[] = [];

    let start = 0;
    let chunkIndex = 0;

    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        const content = text.slice(start, end).trim();

        if (content.length > 0) {
            chunks.push({
                chunkIndex,
                content,
                pageNumber: null,
                tokenCount: estimateTokenCount(content)
            });

            chunkIndex++;
        }

        if (end == text.length) {
            break;
        }

        start = Math.max(end - chunkOverlap, 0);
    }

    return chunks;
};