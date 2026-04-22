"use client";

import { useParams } from "next/navigation";
import Chat from "@/components/home/Chat";

export default function ChatDetailPage() {
    const params = useParams();
    const chatId = Number(params.id);

    if (!chatId || isNaN(chatId)) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Invalid chat ID</p>
            </div>
        );
    }

    return <Chat initialChatId={chatId} />;
}
