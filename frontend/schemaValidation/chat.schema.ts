import { z } from "zod";

// Source schema (used in send message responses)
export const SourceSchema = z.object({
  score: z.number(),
  section_id: z.string(),
  text_preview: z.string(),
  title: z.string(),
  hierarchy_path: z.string()
});

// Source schema for stored messages (slightly different structure)
export const MessageSourceSchema = z.object({
  id: z.string(),
  type: z.string().optional(),
  title: z.string(),
  hierarchy_path: z.string(),
  content: z.string(),
  score: z.number(),
});

// Response metadata schema
export const ResponseMetadataSchema = z.object({
  intent: z.string().optional(),
  strategy: z.string().optional(),
  total_time_ms: z.number().nullable().optional(),
  generation_time_ms: z.number().nullable().optional(),
  num_sources: z.number().int().nullable().optional(),
});

// ============================================
// Send Message API (POST /chats/chat)
// ============================================

// Search mode enum
export const SearchModeSchema = z.enum(["vector", "fulltext", "hybrid"]);
export type SearchModeType = z.infer<typeof SearchModeSchema>;

// Pipeline mode enum
export const PipelineModeSchema = z.enum(["naive", "intent"]);
export type PipelineModeType = z.infer<typeof PipelineModeSchema>;

// Request schema for sending a message
export const SendMessageRequestSchema = z.object({
  chat_id: z.number().nullable().optional(), // null → create new chat
  major: z.string().optional(),
  top_k: z.number().optional(),
  enable_reranking: z.boolean().optional(),
  search_mode: SearchModeSchema.optional(), // vector, fulltext, or hybrid
  pipeline_mode: PipelineModeSchema.optional(), // naive or intent
  role: z.literal("user"),
  content: z.string().min(1),
});

// Response schema for send message
export const SendMessageResponseSchema = z.object({
  chat_id: z.number(),
  message_id: z.number(),
  answer: z.string(),
  sources: z.array(SourceSchema),
  metadata: ResponseMetadataSchema.optional(),
});

// ============================================
// Chat History API (GET /chats)
// ============================================

// Chat item schema for history list
export const ChatItemSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  title: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Chat list response schema
export const ChatListResponseSchema = z.object({
  total: z.number(),
  chats: z.array(ChatItemSchema),
});

// ============================================
// Chat Detail API (GET /chats/{id})
// ============================================

// Message schema for chat detail
export const MessageSchema = z.object({
  id: z.number(),
  chat_id: z.number(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  sources: z.array(MessageSourceSchema).nullable(),
  created_at: z.string(),
});

// Chat with messages schema
export const ChatWithMessagesSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  title: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  messages: z.array(MessageSchema),
});

// ============================================
// Legacy Query API (keeping for backwards compatibility)
// ============================================
export const ChatRequestSchema = z.object({
  query: z.string(),
});

export const MetadataSchema = z.object({
  total_time_ms: z.number().nullable(),
  sources_count: z.number().int().nullable(),
  suggestions_count: z.number().int().nullable(),
});

export const ChatResponseSchema = z.object({
  success: z.boolean(),
  answer: z.string(),
  sources: z.array(SourceSchema),
  suggestions: z.array(z.string()),
  metadata: MetadataSchema,
});

// Type exports
export type SourceType = z.infer<typeof SourceSchema>;
export type MessageSourceType = z.infer<typeof MessageSourceSchema>;
export type MessageType = z.infer<typeof MessageSchema>;
export type SendMessageRequestType = z.infer<typeof SendMessageRequestSchema>;
export type SendMessageResponseType = z.infer<typeof SendMessageResponseSchema>;
export type ChatItemType = z.infer<typeof ChatItemSchema>;
export type ChatListResponseType = z.infer<typeof ChatListResponseSchema>;
export type ChatWithMessagesType = z.infer<typeof ChatWithMessagesSchema>;
export type ChatRequestType = z.infer<typeof ChatRequestSchema>;
export type ChatResponseType = z.infer<typeof ChatResponseSchema>;

// ============================================
// Streaming API (POST /chats/chat/stream) - SSE Events
// ============================================

// Event: chat_info - Contains chat session ID
export interface StreamChatInfoEvent {
  type: "chat_info";
  data: { chat_id: number };
}

// Event: metadata - Retrieval metadata from RAG pipeline
export interface StreamMetadataEvent {
  type: "metadata";
  data: {
    intent?: string;
    refined_query?: string;
    search_mode?: string;
    major?: string | null;
    num_sections?: number;
    retrieval_time_ms?: number;
  };
}

// Event: sources - List of source sections
export interface StreamSourcesEvent {
  type: "sources";
  data: SourceType[];
}

// Event: answer_chunk - Text chunks streamed
export interface StreamAnswerChunkEvent {
  type: "answer_chunk";
  data: string;
}

// Event: done - Final event with message ID
export interface StreamDoneEvent {
  type: "done";
  data: { message_id: number };
}

// Event: error
export interface StreamErrorEvent {
  type: "error";
  data: string;
}

// Union type for all streaming events
export type StreamEvent =
  | StreamChatInfoEvent
  | StreamMetadataEvent
  | StreamSourcesEvent
  | StreamAnswerChunkEvent
  | StreamDoneEvent
  | StreamErrorEvent;
