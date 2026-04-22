"use client";
import { Button } from "@/components/ui/button";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RequestOTPSchema } from "@/schemaValidation/auth.schema";
import { Separator } from "@/components/ui/separator";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import authApiRequest from "@/apiRequests/auth";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { InputOTPForm } from "./_components/InputOTPForm";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [openOTP, setOpenOTP] = useState(false);
  const [otpExpire, setOtpExpire] = useState(0);

  const form = useForm<z.infer<typeof RequestOTPSchema>>({
    resolver: zodResolver(RequestOTPSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof RequestOTPSchema>) => {
    try {
      console.log("Submitted email for OTP request:", values.email);
      const result = await authApiRequest.request(values);
      setEmail(result.payload.email);
      setOtpExpire(result.payload.expires_in_minutes);
      setOpenOTP(true);
    } catch (error) {
      console.error("Error submitting OTP request:", error);
    } finally {
      form.reset();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("sessionToken");
    if (token) {
      router.replace("/");
    }
  }, []);
  return (
    <div className="h-full flex items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <GoogleLoginButton />
          <Separator className="my-4" />
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập email của bạn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full mt-2"
                disabled={!form.formState.isValid}
              >
                Đăng nhập
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Dialog open={openOTP} onOpenChange={setOpenOTP}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Xác thực OTP</DialogTitle>
            <DialogDescription>
              Mã OTP đã được gửi đến email <strong>{email}</strong>
            </DialogDescription>
          </DialogHeader>
          <InputOTPForm expires_in_minutes={10} email={email} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
