import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar/sidebar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Advisor",
  description: "Hỗ trợ sinh viên lập kế hoạch học tập thông minh",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body
        suppressHydrationWarning
        className="h-screen bg-white text-gray-800 flex flex-col font-sans overflow-hidden"
      >
        <div className="flex flex-1 h-full overflow-hidden">
          <Sidebar />
          <main className="flex-1 h-full overflow-hidden ml-16">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
