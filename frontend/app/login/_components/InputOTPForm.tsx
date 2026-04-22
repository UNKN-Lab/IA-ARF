"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import { VerifyOTPSchema } from "@/schemaValidation/auth.schema";
import authApiRequest from "@/apiRequests/auth";
import { useRouter } from "next/navigation";

export function InputOTPForm({
  email,
  expires_in_minutes,
}: {
  email: string;
  expires_in_minutes: number;
}) {
  const router = useRouter();
  const form = useForm<z.infer<typeof VerifyOTPSchema>>({
    resolver: zodResolver(VerifyOTPSchema),
    defaultValues: {
      email: email,
      code: "",
    },
  });

  const [timeLeft, setTimeLeft] = useState(expires_in_minutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = () => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  async function onSubmit(data: z.infer<typeof VerifyOTPSchema>) {
    if (timeLeft <= 0) {
      toast.error("OTP đã hết hạn!");
      return;
    }

    toast.success("Đang kiểm tra mã OTP...");

    try {
      const response = await authApiRequest.verify(data);
      console.log(response);
      localStorage.setItem("name", response.payload.account.name);
      localStorage.setItem("email", response.payload.account.email);
      localStorage.setItem("role", response.payload.account.role);

      // Dispatch custom event để thông báo auth đã thay đổi
      window.dispatchEvent(new Event("auth-change"));

      router.push("/");
    } catch (error) {
      toast.error("Xác minh OTP thất bại. Vui lòng thử lại.");
    }
    // TODO: verify otp
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        {/* COUNTDOWN TIMER */}
        <div className="text-center font-medium text-lg">
          {timeLeft > 0 ? (
            <span>
              Mã OTP sẽ hết hạn sau: <b>{formatTime()}</b>
            </span>
          ) : (
            <span className="text-red-500 font-semibold">
              Mã OTP đã hết hạn
            </span>
          )}
        </div>

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nhập mã OTP</FormLabel>
              <FormControl>
                <InputOTP
                  maxLength={6}
                  {...field}
                  disabled={timeLeft <= 0} // ✅ hết hạn thì disable
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={timeLeft <= 0}>
          Xác minh OTP
        </Button>
      </form>
    </Form>
  );
}
