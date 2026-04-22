"use client"

import { useState } from "react"
import Image from "next/image"
import GoogleLoginButton from "@/components/auth/GoogleLoginButton"
import { OTPInput } from "@/components/ui/input-otp" // dùng component custom

const logoSrc = "/4.png"

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("") // email
  const [otpSent, setOtpSent] = useState(false)
  const [otpValue, setOtpValue] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [otpSuccess, setOtpSuccess] = useState(false)

  function validateEmail() {
    if (!identifier.trim()) {
      setError("Vui lòng nhập email")
      return false
    }
    if (!/^\S+@\S+.\S+$/.test(identifier)) {
      setError("Email không hợp lệ")
      return false
    }
    setError("")
    return true
  }

  async function requestOtp() {
    if (!validateEmail()) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identifier }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error("Gửi OTP thất bại: " + text)
      }
      setOtpSent(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = () => {
    if (otpValue.length < 6) {
      setError("OTP phải đủ 6 ký tự")
      return
    }
    setError("")
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setOtpSuccess(true)
    }, 1000)
  }

  return (<main className="min-h-screen bg-gray-100 flex items-center justify-center p-6"> <div className="w-full max-w-md bg-white border border-gray-300 rounded-2xl shadow-md p-6">
    {/* Header */} <div className="flex flex-col items-center mb-4"> <div className="flex items-end gap-1"> <Image src={logoSrc} alt="Edu Assistant" width={50} height={50} className="object-contain" /> <h1 className="text-2xl font-bold text-gray-900 italic ml-[-20px] mb-[2px]">EduAssist</h1> </div> <p className="text-sm text-gray-600 mt-2 text-center">
      Đăng nhập để tiếp tục — lập lộ trình, tra cứu môn học và nhận gợi ý nghề nghiệp. </p> </div>

    {/* Form */}
    <div className="space-y-4">
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md p-2">{error}</div>}

      {!otpSent ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="ví dụ: han@example.com"
            className="w-full rounded-lg border border-gray-400 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600 bg-white text-sm text-gray-900"
            disabled={loading}
          />
          <button
            onClick={requestOtp}
            className="w-full mt-3 rounded-full bg-gray-900 hover:bg-gray-700 text-white font-semibold py-2 disabled:opacity-60 transition"
            disabled={loading}
          >
            {loading ? "Đang gửi OTP..." : "Gửi OTP"}
          </button>
        </div>
      ) : (
        <div className="max-w-sm mx-auto">
          <h2 className="text-lg font-semibold text-gray-900 text-center mb-3">Nhập OTP</h2>
          <p className="text-sm text-gray-600 text-center mb-4">OTP đã được gửi tới {identifier}</p>

          <OTPInput value={otpValue} onChange={(val: string) => setOtpValue(val)} length={6} />

          {otpSuccess && <div className="mt-2 text-sm text-green-600 text-center">OTP xác nhận thành công!</div>}

          <button
            onClick={handleVerify}
            disabled={loading || otpSuccess}
            className="w-full mt-3 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:opacity-50 transition"
          >
            {loading ? "Đang xác nhận..." : "Xác nhận OTP"}
          </button>

          <div className="mt-2 text-xs text-gray-500 text-center">Mã OTP có hiệu lực trong 5 phút</div>
        </div>
      )}
    </div>

    {/* Divider */}
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-gray-300" />
      <div className="text-xs text-gray-500">hoặc</div>
      <div className="flex-1 h-px bg-gray-300" />
    </div>

    {/* Social */}
    <div className="space-y-3">
      <GoogleLoginButton />
    </div>
  </div>
  </main>

  )
}
