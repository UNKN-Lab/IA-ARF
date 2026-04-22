/**
 * Chat Helper Utilities
 * Các utility functions để support Chat component
 */

import { ChatResponseType } from "@/schemaValidation/chat.schema";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatResponseType["sources"];
  suggestions?: string[];
  metadata?: ChatResponseType["metadata"];
  enhanced_question?: string | null;
  timestamp: number;
}

/**
 * Generate unique message ID
 */
export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Format timestamp for display
 */
export const formatMessageTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // Less than 1 minute
  if (diff < 60000) return "Just now";

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
  }

  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  // Format as date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Local Storage keys
 */
export const STORAGE_KEYS = {
  CONVERSATION_ID: "chat_conversation_id",
  MESSAGES: "chat_messages_history",
  LAST_ACTIVE: "chat_last_active",
} as const;

/**
 * Save conversation to localStorage
 */
export const saveConversation = (
  conversationId: string,
  messages: Message[]
): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEYS.CONVERSATION_ID, conversationId);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE, Date.now().toString());
  } catch (error) {
    console.error("Failed to save conversation:", error);
  }
};

/**
 * Load conversation from localStorage
 */
export const loadConversation = (): {
  conversationId: string | null;
  messages: Message[];
} => {
  if (typeof window === "undefined") {
    return { conversationId: null, messages: [] };
  }

  try {
    const conversationId = localStorage.getItem(STORAGE_KEYS.CONVERSATION_ID);
    const messagesJson = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const messages = messagesJson ? JSON.parse(messagesJson) : [];

    // Check if conversation is stale (older than 24 hours)
    const lastActive = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVE);
    if (lastActive) {
      const diff = Date.now() - parseInt(lastActive);
      if (diff > 86400000) {
        // 24 hours
        clearConversation();
        return { conversationId: null, messages: [] };
      }
    }

    return { conversationId, messages };
  } catch (error) {
    console.error("Failed to load conversation:", error);
    return { conversationId: null, messages: [] };
  }
};

/**
 * Clear conversation from localStorage
 */
export const clearConversation = (): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEYS.CONVERSATION_ID);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVE);
  } catch (error) {
    console.error("Failed to clear conversation:", error);
  }
};

/**
 * Export conversation as JSON
 */
export const exportConversation = (
  conversationId: string,
  messages: Message[]
): void => {
  const data = {
    conversationId,
    messages,
    exportedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `chat-${conversationId}-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Export conversation as Markdown
 */
export const exportConversationAsMarkdown = (
  messages: Message[]
): void => {
  let markdown = "# Chat Conversation\n\n";
  markdown += `Exported at: ${new Date().toLocaleString()}\n\n---\n\n`;

  messages.forEach((msg, idx) => {
    const role = msg.role === "user" ? "👤 You" : "🤖 AI Assistant";
    markdown += `## ${role}\n\n`;
    markdown += `${msg.content}\n\n`;

    if (msg.sources && msg.sources.length > 0) {
      markdown += `### Sources\n\n`;
      msg.sources.forEach((source, sourceIdx) => {
        markdown += `${sourceIdx + 1}. **${source.title}** (Score: ${source.score.toFixed(3)})\n`;
        markdown += `   ${source.content}\n\n`;
      });
    }

    if (msg.suggestions && msg.suggestions.length > 0) {
      markdown += `### Suggested Questions\n\n`;
      msg.suggestions.forEach((suggestion) => {
        markdown += `- ${suggestion}\n`;
      });
      markdown += `\n`;
    }

    markdown += `---\n\n`;
  });

  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `chat-conversation-${Date.now()}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Calculate statistics from messages
 */
export const getConversationStats = (messages: Message[]) => {
  const userMessages = messages.filter((m) => m.role === "user");
  const aiMessages = messages.filter((m) => m.role === "assistant");

  const totalSources = aiMessages.reduce(
    (sum, m) => sum + (m.sources?.length || 0),
    0
  );

  const totalProcessingTime = aiMessages.reduce(
    (sum, m) => sum + (m.metadata?.processing_time || 0),
    0
  );

  const avgProcessingTime =
    aiMessages.length > 0 ? totalProcessingTime / aiMessages.length : 0;

  return {
    totalMessages: messages.length,
    userMessages: userMessages.length,
    aiMessages: aiMessages.length,
    totalSources,
    avgSourcesPerResponse: aiMessages.length > 0 ? totalSources / aiMessages.length : 0,
    avgProcessingTime,
    totalProcessingTime,
  };
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

/**
 * Highlight search term in text
 */
export const highlightText = (text: string, searchTerm: string): string => {
  if (!searchTerm) return text;
  const regex = new RegExp(`(${searchTerm})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
};

/**
 * Check if message contains code
 */
export const hasCodeBlock = (content: string): boolean => {
  return /```[\s\S]*```/.test(content);
};

/**
 * Extract code blocks from message
 */
export const extractCodeBlocks = (
  content: string
): Array<{ language: string; code: string }> => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks: Array<{ language: string; code: string }> = [];
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    blocks.push({
      language: match[1] || "text",
      code: match[2].trim(),
    });
  }

  return blocks;
};

/**
 * Sanitize user input
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/\s+/g, " ").slice(0, 4000); // Max 4000 chars
};

/**
 * Validate conversation ID format
 */
export const isValidConversationId = (id: string | null): boolean => {
  if (!id) return false;
  // Giả sử format: uuid hoặc alphanumeric với dấu gạch ngang
  return /^[a-zA-Z0-9-_]+$/.test(id);
};

/**
 * Format source score for display
 */
export const formatSourceScore = (score: number): string => {
  if (score >= 0.9) return "Excellent";
  if (score >= 0.7) return "Good";
  if (score >= 0.5) return "Fair";
  return "Low";
};

/**
 * Get color for source score
 */
export const getSourceScoreColor = (
  score: number
): "green" | "blue" | "yellow" | "red" => {
  if (score >= 0.9) return "green";
  if (score >= 0.7) return "blue";
  if (score >= 0.5) return "yellow";
  return "red";
};
