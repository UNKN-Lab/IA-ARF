"use client";

/**
 * Document Parser - Markdown First Approach
 * All functions return Markdown strings directly for use with Tiptap editor
 */

/**
 * Parse DOCX file to Markdown using backend API
 */
export async function parseDocx(file: File): Promise<string> {
    console.log("[parseDocx] Starting DOCX parsing for:", file.name);

    try {
        const documentApiRequest = (await import("@/apiRequests/document")).default;
        const result = await documentApiRequest.parseDocxToMarkdown(file);

        console.log("[parseDocx] Backend API response:", {
            success: result.success,
            filename: result.filename,
            markdownLength: result.markdown?.length,
        });

        if (!result.success || !result.markdown) {
            throw new Error("Backend failed to parse DOCX");
        }

        console.log("[parseDocx] DOCX parsing complete");
        return result.markdown;
    } catch (error) {
        console.error("[parseDocx] DOCX parsing error:", error);
        throw new Error(
            error instanceof Error
                ? error.message
                : "Không thể đọc file DOCX. Vui lòng thử file khác."
        );
    }
}

/**
 * Parse Markdown file - simply reads and returns the text content
 */
export async function parseMarkdown(file: File): Promise<string> {
    console.log("[parseMarkdown] Starting Markdown parsing for:", file.name);
    const text = await file.text();
    console.log("[parseMarkdown] Markdown parsing complete");
    return text;
}

/**
 * Parse PDF file to Markdown using backend API
 */
export async function parsePdf(file: File): Promise<string> {
    console.log("[parsePdf] Starting PDF parsing for:", file.name);

    try {
        const documentApiRequest = (await import("@/apiRequests/document")).default;
        const result = await documentApiRequest.parsePdfToMarkdown(file);

        console.log("[parsePdf] Backend API response:", {
            success: result.success,
            filename: result.filename,
            pages: result.pages,
            markdownLength: result.markdown?.length,
        });

        if (!result.success || !result.markdown) {
            throw new Error("Backend failed to parse PDF");
        }

        console.log("[parsePdf] PDF parsing complete");
        return result.markdown;
    } catch (error) {
        console.error("[parsePdf] PDF parsing error:", error);
        throw new Error(
            error instanceof Error
                ? error.message
                : "Không thể đọc file PDF. Vui lòng thử file khác."
        );
    }
}

/**
 * Detect file type from file header bytes (magic numbers)
 */
async function detectFileType(file: File): Promise<"pdf" | "docx" | "markdown" | "unknown"> {
    const arrayBuffer = await file.slice(0, 8).arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // PDF magic number: %PDF (0x25 0x50 0x44 0x46)
    if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
        console.log("[detectFileType] Detected PDF by magic number");
        return "pdf";
    }

    // DOCX/ZIP magic number: PK (0x50 0x4B)
    if (bytes[0] === 0x50 && bytes[1] === 0x4B) {
        console.log("[detectFileType] Detected DOCX by magic number (ZIP format)");
        return "docx";
    }

    // Check extension for markdown
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith(".md") || fileName.endsWith(".markdown")) {
        console.log("[detectFileType] Detected Markdown by extension");
        return "markdown";
    }

    console.log("[detectFileType] Unknown file type, bytes:", Array.from(bytes.slice(0, 4)));
    return "unknown";
}

/**
 * Parse document file (DOCX, PDF, or Markdown) to Markdown
 * Returns the markdown string directly
 */
export async function parseDocument(file: File): Promise<string> {
    const fileName = file.name.toLowerCase();
    const mimeType = file.type.toLowerCase();

    console.log("[parseDocument] File:", fileName, "MIME:", mimeType, "Size:", file.size);

    // First, detect by magic number (most reliable)
    const detectedType = await detectFileType(file);
    console.log("[parseDocument] Detected type:", detectedType);

    if (detectedType === "pdf") {
        return parsePdf(file);
    } else if (detectedType === "docx") {
        return parseDocx(file);
    } else if (detectedType === "markdown") {
        return parseMarkdown(file);
    }

    // Fallback to MIME type
    if (mimeType === "application/pdf") {
        console.log("[parseDocument] Using MIME type: PDF");
        return parsePdf(file);
    } else if (
        mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        mimeType === "application/msword"
    ) {
        console.log("[parseDocument] Using MIME type: DOCX");
        return parseDocx(file);
    } else if (mimeType === "text/markdown" || mimeType === "text/x-markdown") {
        console.log("[parseDocument] Using MIME type: Markdown");
        return parseMarkdown(file);
    }

    // Fallback to extension
    if (fileName.endsWith(".pdf")) {
        console.log("[parseDocument] Using extension: PDF");
        return parsePdf(file);
    } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
        console.log("[parseDocument] Using extension: DOCX");
        return parseDocx(file);
    } else if (fileName.endsWith(".md") || fileName.endsWith(".markdown")) {
        console.log("[parseDocument] Using extension: Markdown");
        return parseMarkdown(file);
    }

    throw new Error(`Unsupported file type: ${fileName} (${mimeType}). Supported: .docx, .pdf, .md`);
}

/**
 * Check if file type is supported
 */
export function isSupportedFileType(file: File): boolean {
    const fileName = file.name.toLowerCase();
    const mimeType = file.type.toLowerCase();

    const supportedMimes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "text/markdown",
        "text/x-markdown",
        "text/plain"
    ];

    const supportedExtensions = [".docx", ".doc", ".pdf", ".md", ".markdown"];

    return (
        supportedMimes.includes(mimeType) ||
        supportedExtensions.some(ext => fileName.endsWith(ext))
    );
}
