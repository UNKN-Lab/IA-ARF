import http from "@/lib/http";
import envConfig from "@/config";
import {
  ChatRequestType,
  ChatResponseType,
  ChatListResponseType,
  SendMessageRequestType,
  SendMessageResponseType,
  ChatWithMessagesType,
  StreamEvent,
  SourceType,
  StreamMetadataEvent,
} from "@/schemaValidation/chat.schema";

// Callbacks for streaming events
export interface StreamCallbacks {
  onChatInfo?: (chatId: number) => void;
  onMetadata?: (metadata: StreamMetadataEvent["data"]) => void;
  onSources?: (sources: SourceType[]) => void;
  onAnswerChunk?: (chunk: string) => void;
  onDone?: (messageId: number) => void;
  onError?: (error: string) => void;
}

const chatApiRequest = {
  // New chat API - POST /chats/chat
  sendMessage: (body: SendMessageRequestType) =>
    http.post<SendMessageResponseType>("/chats/chat", body),

  // Streaming chat API - POST /chats/chat/stream
  sendMessageStream: async (body: SendMessageRequestType, callbacks: StreamCallbacks) => {
    const sessionToken = localStorage.getItem("sessionToken");
    const baseUrl = envConfig.NEXT_PUBLIC_API_ENDPOINT;

    const response = await fetch(`${baseUrl}/chats/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Stream request failed" }));
      callbacks.onError?.(errorData.message || "Stream request failed");
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      callbacks.onError?.("No response body");
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;

        try {
          const event: StreamEvent = JSON.parse(line.slice(6));

          switch (event.type) {
            case "chat_info":
              callbacks.onChatInfo?.(event.data.chat_id);
              break;
            case "metadata":
              callbacks.onMetadata?.(event.data);
              break;
            case "sources":
              callbacks.onSources?.(event.data);
              break;
            case "answer_chunk":
              callbacks.onAnswerChunk?.(event.data);
              break;
            case "done":
              callbacks.onDone?.(event.data.message_id);
              break;
            case "error":
              callbacks.onError?.(event.data);
              break;
          }
        } catch (e) {
          console.error("Failed to parse SSE event:", line, e);
        }
      }
    }
  },

  // Get chat history list
  getList: () =>
    http.get<ChatListResponseType>("/chats"),

  // Get chat detail with messages
  getChat: (chatId: number) =>
    http.get<ChatWithMessagesType>(`/chats/${chatId}`),

  // Legacy query API (kept for backwards compatibility)
  query: (body: ChatRequestType) =>
    http.post<ChatResponseType>("/query/intent", body),
};

export default chatApiRequest;
