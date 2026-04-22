import http from "@/lib/http";
import {
    DocumentRequestType,
    DocumentResponseType,
    DocumentListResponseType,
    DocumentListParams,
} from "@/schemaValidation/document.schema";

export interface DocToMarkdownResponse {
    success: boolean;
    markdown: string;
    filename: string;
    pages?: number;
}

// Mock ingest payload with doc_type instead of type
export interface MockIngestPayload {
    title: string;
    body: string;
    doc_type: "program" | "syllabus" | "policy";
    academic_year: string;
}

const documentApiRequest = {
    getList: (params?: DocumentListParams) => {
        const queryParams = new URLSearchParams();
        if (params?.skip !== undefined) queryParams.append("skip", String(params.skip));
        if (params?.limit !== undefined) queryParams.append("limit", String(params.limit));
        const queryString = queryParams.toString();
        return http.get<DocumentListResponseType>(`/docs${queryString ? `?${queryString}` : ""}`);
    },
    getDetail: (id: number) =>
        http.get<DocumentResponseType>(`/docs/${id}`),
    create: (body: DocumentRequestType) =>
        http.post<DocumentResponseType>("/docs", body),

    update: (id: number, body: Partial<DocumentRequestType>) =>
        http.put<DocumentResponseType>(`/docs/${id}`, body),

    mockIngest: (body: MockIngestPayload) =>
        http.post("/docs/mock-ingest", body),

    delete: (id: number) =>
        http.delete<{ success: boolean }>(`/docs/${id}`),

    parsePdfToMarkdown: async (file: File): Promise<DocToMarkdownResponse> => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_ENDPOINT}/parse/pdf-to-markdown`,
            {
                method: "POST",
                body: formData,
            }
        );

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || "Failed to parse PDF");
        }

        return response.json();
    },

    parseDocxToMarkdown: async (file: File): Promise<DocToMarkdownResponse> => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_ENDPOINT}/parse/docx-to-markdown`,
            {
                method: "POST",
                body: formData,
            }
        );

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || "Failed to parse DOCX");
        }

        return response.json();
    },
};

export default documentApiRequest;
