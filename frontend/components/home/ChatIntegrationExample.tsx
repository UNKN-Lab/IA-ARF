/**
 * EXAMPLE INTEGRATION - Chat Component
 *
 * Đây là ví dụ cách integrate Chat component vào page với layout hoàn chỉnh
 * Có thể copy code này để customize theo nhu cầu
 */

import Chat from "@/components/home/Chat";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function ExampleChatPage() {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header (optional) */}
      <Header />

      {/* Main Chat Area */}
      <main className="flex-1 overflow-hidden">
        <Chat className="h-full" />
      </main>

      {/* Footer (optional) */}
      <Footer />
    </div>
  );
}

/**
 * INTEGRATION OPTIONS:
 *
 * 1. Simple (current app/page.tsx):
 *    <Chat />
 *
 * 2. With container:
 *    <div className="container mx-auto h-screen">
 *      <Chat className="h-full" />
 *    </div>
 *
 * 3. With sidebar:
 *    <div className="flex h-screen">
 *      <Sidebar />
 *      <Chat className="flex-1" />
 *    </div>
 *
 * 4. Full screen modal:
 *    <Dialog open={isOpen}>
 *      <DialogContent className="h-screen max-w-full">
 *        <Chat />
 *      </DialogContent>
 *    </Dialog>
 *
 * 5. With dynamic config:
 *    <Chat
 *      className="h-full"
 *      config={{
 *        topK: 10,
 *        useEnhancement: true,
 *        theme: "dark"
 *      }}
 *    />
 */

/**
 * ENVIRONMENT VARIABLES NEEDED:
 *
 * .env.local:
 * NEXT_PUBLIC_API_ENDPOINT=http://localhost:8000
 *
 * Đảm bảo backend endpoint được set đúng trong config.ts
 */

/**
 * KEYBOARD SHORTCUTS:
 * - Enter: Send message
 * - Shift + Enter: New line
 * - Escape: Clear input (có thể thêm)
 * - Ctrl/Cmd + K: Focus input (có thể thêm)
 */

/**
 * CUSTOMIZATION TIPS:
 *
 * 1. Change colors:
 *    - Edit blue-600/700 → your brand colors
 *    - Update gradient classes
 *
 * 2. Add features:
 *    - Voice input: Add <Button> with mic icon
 *    - File upload: Add <Input type="file">
 *    - Export chat: Add download button
 *
 * 3. Modify behavior:
 *    - Auto-send: Remove Enter key handler
 *    - Disable sources: Comment out sources section
 *    - Hide suggestions: Remove suggestions rendering
 *
 * 4. Performance:
 *    - Add virtualization for long chats
 *    - Implement message pagination
 *    - Add local storage cache
 */
