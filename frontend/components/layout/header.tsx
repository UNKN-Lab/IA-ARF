"use client";
import Image from "next/image";
import logo from "@/public/EduAsitant-logo.png";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-white shadow-md border-b border-gray-200 p-4 flex items-center justify-between">
      {/* Search + Buttons */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Tìm môn học..."
          className="rounded-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1E88E5] text-gray-700 w-64"
        />

        {/* Nút đăng nhập và đăng ký */}
        <Link
          href="/login"
          className="bg-[#1E88E5] hover:bg-[#1565C0] text-white font-semibold px-4 py-2 rounded-full transition"
        >
          Đăng nhập
        </Link>

        <Link
          href="/signup"
          className="bg-yellow-400 hover:bg-yellow-500 text-[#0D47A1] font-semibold px-4 py-2 rounded-full transition"
        >
          Đăng ký
        </Link>
      </div>
    </header>
  );
}
