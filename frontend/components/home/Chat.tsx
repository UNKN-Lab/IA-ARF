"use client";

import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import chatApiRequest from "@/apiRequests/chat";
import MarkdownMessage from "@/components/chat/MarkdownMessage";
import { SourceType, SendMessageResponseType, MessageSourceType, SearchModeType, PipelineModeType } from "@/schemaValidation/chat.schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUp, Sparkles, FileText, ChevronRight, Loader2, X } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner"
import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceType[] | MessageSourceType[];
  metadata?: SendMessageResponseType["metadata"];
}

interface ChatProps {
  className?: string;
  initialChatId?: number | null;
}

const Chat: React.FC<ChatProps> = ({ className, initialChatId = null }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [chatId, setChatId] = useState<number | null>(initialChatId);
  // State để chọn search mode
  const [searchMode, setSearchMode] = useState<SearchModeType>("vector");
  // State để chọn pipeline mode
  const [pipelineMode, setPipelineMode] = useState<PipelineModeType>("intent");
  // State để track message nào đang được xem sources
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Lấy message đang được chọn để hiển thị sources
  const selectedMessage = messages.find((m) => m.id === selectedMessageId);

  // Load existing chat if initialChatId is provided
  useEffect(() => {
    if (initialChatId) {
      loadChat(initialChatId);
    }
  }, [initialChatId]);

  const loadChat = async (chatIdToLoad: number) => {
    try {
      setIsLoadingChat(true);
      const response = await chatApiRequest.getChat(chatIdToLoad);

      if (response.payload) {
        setChatId(response.payload.id);

        // Convert API messages to local Message format
        const loadedMessages: Message[] = response.payload.messages.map((msg) => ({
          id: msg.id.toString(),
          role: msg.role,
          content: msg.content,
          sources: msg.sources || undefined,
        }));

        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error("Failed to load chat:", error);
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSend = async (question?: string) => {
    const messageText = question || input.trim();
    if (!messageText || isLoading) return;

    // Clear input nếu không phải từ suggestion
    if (!question) setInput("");

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Use new sendMessage API
      console.log("Sending message:", chatId);
      const response = await chatApiRequest.sendMessage({
        chat_id: chatId,
        role: "user",
        content: messageText,
        search_mode: searchMode,
        pipeline_mode: pipelineMode,
      });

      console.log("Chat response:", response);

      // Always update chatId from response to continue the conversation
      if (response.payload.chat_id) {
        setChatId(response.payload.chat_id);
      }

      // Add assistant message with full data
      const assistantMessage: Message = {
        id: response.payload.message_id?.toString() || (Date.now() + 1).toString(),
        role: "assistant",
        content: response.payload.answer ?? "",
        sources: response.payload.sources ?? [],
        metadata: response.payload.metadata,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      // Error handling
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ **Error**: ${error?.payload?.message || error?.message || "Failed to get response"
          }`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Toggle sources panel - bấm lần nữa sẽ đóng
  const toggleSourcesPanel = (messageId: string) => {
    setSelectedMessageId((prev) => (prev === messageId ? null : messageId));
  };

  // Đóng sources panel
  const closeSourcesPanel = () => {
    setSelectedMessageId(null);
  };

  // Check if there are any messages
  const hasMessages = messages.length > 0;

  return (
    <div className={`flex h-full w-full ${className}`}>
      {/* Left Side: Chat Container */}
      <div className={`flex flex-col h-full min-h-0 transition-all duration-300 ${selectedMessageId ? "flex-[6]" : "flex-1"
        }`}>

        {/* Empty State - Welcome Screen with Centered Input */}
        {!hasMessages ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-[700px] space-y-8">
              {/* Welcome Title */}
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Sparkles className="w-10 h-10 text-blue-600" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-transparent bg-clip-text">
                  EduAssist
                </h1>
                <p className="text-gray-500 text-lg">
                  Trợ lý AI hỗ trợ sinh viên - Hỏi bất cứ điều gì!
                </p>
              </div>

              {/* Centered Input Box */}
              <InputGroup className="rounded-2xl shadow-xl border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
                <InputGroupTextarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Hỏi về chương trình đào tạo, môn học, quy định..."
                  rows={3}
                  disabled={isLoading}
                  className="text-base px-4"
                />
                <InputGroupAddon align="block-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <InputGroupButton variant="ghost" className="text-xs capitalize">
                        {searchMode}
                      </InputGroupButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="top"
                      align="start"
                      className="[--radius:0.95rem]"
                    >
                      <DropdownMenuItem onClick={() => setSearchMode("vector")}>
                        Vector
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSearchMode("fulltext")}>
                        Fulltext
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSearchMode("hybrid")}>
                        Hybrid
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <InputGroupButton variant="ghost" className="text-xs capitalize">
                        {pipelineMode}
                      </InputGroupButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="top"
                      align="start"
                      className="[--radius:0.95rem]"
                    >
                      <DropdownMenuItem onClick={() => setPipelineMode("naive")}>
                        Naive
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPipelineMode("intent")}>
                        Intent
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <InputGroupButton
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    variant="default"
                    className="rounded-full ml-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400"
                    size="icon-sm"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <ArrowUp className="w-5 h-5" />
                    )}
                    <span className="sr-only">Gửi</span>
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>

              {/* Quick Suggestions */}
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "Chương trình đào tạo CNTT gồm những môn gì?",
                  "Quy định về điểm rèn luyện?",
                  "Học phí năm 2024 là bao nhiêu?",
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(suggestion)}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-all disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
              <div className="max-w-[752px] mx-auto space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start w-full"
                      }`}
                  >
                    <div
                      className={`${message.role === "user" ? "max-w-[85%]" : "w-full"
                        }`}
                    >
                      {/* User Message */}
                      {message.role === "user" && (
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl px-3 py-2 shadow-lg shadow-blue-200">
                          <p className="text-sm leading-relaxed">
                            {message.content}
                          </p>
                        </div>
                      )}

                      {/* Assistant Message */}
                      {message.role === "assistant" && (
                        <div className="space-y-4">

                          {/* Main Answer - No border, full width like Claude */}
                          <div className="prose prose-sm max-w-none text-gray-800">
                            <MarkdownMessage content={message.content} />
                          </div>

                          {/* Sources Button - Opens right panel */}
                          {message.sources && message.sources.length > 0 && (
                            <button
                              onClick={() => toggleSourcesPanel(message.id)}
                              className={`flex items-center gap-2 text-sm font-medium transition-all px-3 py-2 rounded-lg ${selectedMessageId === message.id
                                ? "bg-blue-100 text-blue-700 border border-blue-300"
                                : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                                }`}
                            >
                              <FileText className="w-4 h-4" />
                              <span>
                                {message.sources.length} Source
                                {message.sources.length > 1 ? "s" : ""}
                              </span>
                              <ChevronRight
                                className={`w-4 h-4 transition-transform ${selectedMessageId === message.id ? "rotate-90" : ""
                                  }`}
                              />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <Item variant="muted">
                      <ItemMedia>
                        <Spinner />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle className="line-clamp-1">Processing answer....</ItemTitle>
                      </ItemContent>
                    </Item>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area - Fixed at bottom when has messages */}
            <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm p-4">
              <div className="max-w-[752px] mx-auto">
                <InputGroup className="rounded-2xl shadow-lg border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
                  <InputGroupTextarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Tiếp tục hỏi..."
                    rows={1}
                    disabled={isLoading}
                    className="text-sm px-3 min-h-[40px]"
                  />
                  <InputGroupAddon align="block-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <InputGroupButton variant="ghost" className="text-xs capitalize">
                          {searchMode}
                        </InputGroupButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        side="top"
                        align="start"
                        className="[--radius:0.95rem]"
                      >
                        <DropdownMenuItem onClick={() => setSearchMode("vector")}>
                          Vector
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSearchMode("fulltext")}>
                          Fulltext
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSearchMode("hybrid")}>
                          Hybrid
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <InputGroupButton variant="ghost" className="text-xs capitalize">
                          {pipelineMode}
                        </InputGroupButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        side="top"
                        align="start"
                        className="[--radius:0.95rem]"
                      >
                        <DropdownMenuItem onClick={() => setPipelineMode("naive")}>
                          Naive
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPipelineMode("intent")}>
                          Intent
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <InputGroupButton
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isLoading}
                      variant="default"
                      className="rounded-full ml-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400"
                      size="icon-sm"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <ArrowUp className="w-5 h-5" />
                      )}
                      <span className="sr-only">Gửi</span>
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right Side: Sources Panel */}
      {selectedMessageId && selectedMessage?.sources && (
        <div className="flex-[4] h-full min-h-0 min-w-[350px] max-w-[500px] border-l border-gray-200 bg-gray-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
          {/* Panel Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">
                Sources ({selectedMessage.sources.length})
              </h3>
            </div>
            <button
              onClick={closeSourcesPanel}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Sources List */}
          <div className="flex-1 overflow-y-auto h-full p-4 space-y-3">
            {selectedMessage.sources.map((source, idx) => (
              <div
                key={`source-panel-${idx}`}
                className="p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      {source.title}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                      {/* Handle both SourceType (text_preview) and MessageSourceType (content) */}
                      {'text_preview' in source ? source.text_preview : 'content' in source ? source.content : ''}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                        Score: {source.score.toFixed(3)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
