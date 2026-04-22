import { z } from "zod";

// Document types enum
export const DocumentType = {
    PROGRAM: "program",
    SYLLABUS: "syllabus",
    POLICY: "policy",
} as const;

// Request schema for creating/updating documents
export const DocumentRequestSchema = z.object({
    title: z.string().min(1, "Tiêu đề không được để trống"),
    type: z.enum(["program", "syllabus", "policy"]),
    academic_year: z.string().min(1, "Năm học không được để trống"),
    body: z.string().min(1, "Nội dung không được để trống"),
});

// Response schema for a single document
export const DocumentResponseSchema = z.object({
    id: z.number(),
    user_id: z.number().optional(),
    title: z.string(),
    type: z.string(),
    academic_year: z.string(),
    body: z.string(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});

// Pagination params for list request
export interface DocumentListParams {
    skip?: number;
    limit?: number;
}

// Response schema for document list with pagination
export const DocumentListResponseSchema = z.object({
    total: z.number(),
    skip: z.number(),
    limit: z.number(),
    documents: z.array(DocumentResponseSchema),
});

// Type exports
export type DocumentRequestType = z.infer<typeof DocumentRequestSchema>;
export type DocumentResponseType = z.infer<typeof DocumentResponseSchema>;
export type DocumentListResponseType = z.infer<typeof DocumentListResponseSchema>;

