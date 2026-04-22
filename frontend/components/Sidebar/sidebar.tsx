"use client";

import Image from "next/image";
import { MessageSquarePlus, LogIn, ChevronUp, User, LogOut, File, MessageCircle } from "lucide-react";
import NavItem from "./navitem";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import chatApiRequest from "@/apiRequests/chat";
import { ChatItemType } from "@/schemaValidation/chat.schema";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Hooks phải ở trên cùng, TRƯỚC bất kỳ conditional return nào
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar?: string;
  } | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatItemType[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);

  // Hàm load user từ localStorage
  const loadUserFromStorage = () => {
    const token = localStorage.getItem("sessionToken");
    if (token) {
      setHasToken(true);
    } else {
      setHasToken(false);
    }
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");
    if (name || email) {
      setUser({ name: name || "", email: email || "" });
    } else {
      setUser(null);
    }
  };

  // Fetch chat history
  const loadChatHistory = async () => {
    const token = localStorage.getItem("sessionToken");
    if (!token) {
      setChatHistory([]);
      return;
    }

    try {
      setIsLoadingChats(true);
      const response = await chatApiRequest.getList();
      setChatHistory(response.payload.chats || []);
    } catch (error) {
      console.error("Failed to load chat history:", error);
      setChatHistory([]);
    } finally {
      setIsLoadingChats(false);
    }
  };

  useEffect(() => {
    // Load lần đầu
    loadUserFromStorage();
    loadChatHistory();

    // Lắng nghe event 'auth-change' để cập nhật khi login/logout
    const handleAuthChange = () => {
      loadUserFromStorage();
      loadChatHistory();
    };

    window.addEventListener("auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, []);

  // Ẩn sidebar trên trang login (SAU khi gọi hooks)
  if (pathname === "/login") {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    setHasToken(false);
    setUser(null);
    setChatHistory([]);

    // Dispatch event để các component khác biết
    window.dispatchEvent(new Event("auth-change"));

    router.push("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside
      className={`
        group fixed left-0 top-0 h-screen z-50
        bg-background border-r shadow-sm
        transition-all duration-300 ease-in-out
        overflow-hidden
        flex flex-col
        ${isDropdownOpen ? "w-64" : "w-16 hover:w-64"}
      `}
    >
      {/* Logo luôn hiển thị */}
      <div className="flex items-end gap-3 p-4 mb-2 flex-shrink-0">
        <Image
          src="/4.png"
          alt="Logo"
          width={32}
          height={32}
          className="rounded-md flex-shrink-0"
        />
        <span
          className={`
            text-sm font-medium text-neutral-600 italic
            transition-opacity duration-300
            whitespace-nowrap ml-[-20px] mb-[2px]
            ${isDropdownOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
          `}
        >
          EduAssist
        </span>
      </div>

      {/* Main nav items */}
      <nav className="space-y-1 px-2 flex-shrink-0">
        <NavItem icon={<MessageSquarePlus />} link="/chat-stream" label="New Chat" />
        <NavItem icon={<File />} link="/document" label="Documents" />
      </nav>

      {/* Chat History Section */}
      {hasToken && (
        <div className="flex-1 overflow-hidden flex flex-col mt-4 min-h-0">
          <div className={`px-4 mb-2 transition-opacity duration-300 ${isDropdownOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">History Chat</p>
          </div>
          <div className="flex-1 overflow-y-auto px-2 scrollbar-hide">
            {isLoadingChats ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              </div>
            ) : chatHistory.length === 0 ? (
              <p className={`text-xs text-gray-400 px-2 py-2 transition-opacity duration-300 ${isDropdownOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                N
              </p>
            ) : (
              chatHistory.map((chat) => (
                <Link
                  key={chat.id}
                  href={`/chat-stream/${chat.id}`}
                  className={`
                    flex items-center gap-2 px-2 py-2 rounded-lg
                    hover:bg-gray-100 transition-colors
                    ${pathname === `/chat-stream/${chat.id}` ? "bg-gray-100" : ""}
                  `}
                >
                  <MessageCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className={`text-sm text-gray-700 truncate transition-opacity duration-300 ${isDropdownOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                    {chat.title}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      {/* User info hoặc Login button ở cuối sidebar */}
      {hasToken && user ? (
        <div className="mx-2 mb-3">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className={`
                  w-full flex items-center gap-2 rounded-lg
                  bg-white shadow hover:bg-gray-50
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${isDropdownOpen ? "p-2" : "p-1.5 group-hover:p-2"}
                `}
              >
                {/* Avatar - nhỏ lại khi sidebar thu nhỏ */}
                <Avatar className={`flex-shrink-0 transition-all duration-300 ${isDropdownOpen ? "h-9 w-9" : "h-8 w-8 group-hover:h-9 group-hover:w-9"}`}>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-blue-500 text-white text-xs font-medium">
                    {getInitials(user.name || user.email)}
                  </AvatarFallback>
                </Avatar>

                {/* User info - ẩn khi sidebar thu nhỏ */}
                <div className={`flex-1 text-left transition-opacity duration-300 overflow-hidden min-w-0 ${isDropdownOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>

                {/* Chevron icon - ẩn khi sidebar thu nhỏ */}
                <ChevronUp className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-all duration-300 ${isDropdownOpen ? "opacity-100 rotate-180" : "opacity-0 group-hover:opacity-100"}`} />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" side="top" className="w-56 mb-1">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                  <User className="w-4 h-4" />
                  <span>About me</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <div className="px-2 mb-3">
          <Button asChild variant="outline" className="w-full justify-start gap-3">
            <Link href="/login">
              <LogIn className="w-5 h-5 flex-shrink-0" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Đăng nhập
              </span>
            </Link>
          </Button>
        </div>
      )}
    </aside>
  );
}


