"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (error) {
      alert(`Authentication error: ${error}`);
      // optionally redirect back to login
      router.replace("/login");
      return;
    }

    if (token) {
      // persist token to localStorage using the same keys as lib/http.ts so
      // the HTTP client automatically attaches it to requests
      localStorage.setItem("sessionToken", token);
      // optional: if backend also returned expiresAt as query param, store it
      const expiresAt = params.get("expiresAt");
      if (expiresAt) localStorage.setItem("sessionTokenExpiresAt", expiresAt);
      // remove token from URL to avoid leaks in history
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      // redirect to home or where you want
      router.replace("/");
    } else {
      // no token, go back to login
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-sm">Đang xử lý đăng nhập, vui lòng chờ...</p>
      </div>
    </div>
  );
}
