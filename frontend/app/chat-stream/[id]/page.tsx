"use client";

import { useParams } from "next/navigation";
import ChatStream from "@/components/home/ChatStream";

export default function ChatStreamDetailPage() {
    const params = useParams();
    const chatId = Number(params.id);

    if (!chatId || isNaN(chatId)) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Invalid chat ID</p>
            </div>
        );
    }

    return <ChatStream initialChatId={chatId} className="h-screen" />;
}
