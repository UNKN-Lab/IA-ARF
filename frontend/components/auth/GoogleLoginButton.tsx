"use client";
import React, { useState } from "react";
import http from "@/lib/http";
import { Button } from "@/components/ui/button";

export default function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);

  async function startGoogleLogin() {
    setLoading(true);
    try {
      // Build callback URL that Google will redirect back to
      const origin = window.location.origin;
      const callbackPath = "/login/callback";
      const redirectUrl = `${origin}${callbackPath}`;

      let payload: any = null;
      let lastError: any = null;

      const path = `/api/auth/login/google?redirect_url=${encodeURIComponent(
        redirectUrl
      )}`;
      try {
        const res = await http.get<any>(path);
        // http.get returns { status, payload }
        if (res && res.payload) {
          payload = res.payload;
        }
      } catch (err) {
        lastError = err;
        // try next candidate
      }

      if (!payload) {
        throw new Error(
          lastError?.message ||
          JSON.stringify(lastError) ||
          "No response from backend"
        );
      }

      const url =
        payload.authorization_url || payload.authorizationUrl || payload.url;
      if (!url) throw new Error("No authorization_url returned from server");

      // Redirect browser to Google's auth page
      window.location.href = url;
    } catch (err: any) {
      console.error("Google login error:", err);
      // Prefer more descriptive message when we have a server-provided detail
      const message = err?.payload?.detail || err?.message || String(err);
      alert(`Lỗi khi bắt đầu đăng nhập Google: ${message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      onClick={startGoogleLogin}
      variant={"default"}
      className="w-full"
      disabled={loading}
    >
      {loading ? "Đang chuyển hướng..." : "Đăng nhập với Google"}
    </Button>
  );
}
