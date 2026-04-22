import { z } from "zod";
// Request schema
export const RequestOTPSchema = z
  .object({
    email: z.email(),
  })
  .strict();

export type RequestOTPType = z.infer<typeof RequestOTPSchema>;

export const OTPRequestResponseSchema = z
  .object({
    message: z.string(),
    email: z.email(),
    expires_in_minutes: z.number().int().positive(),
  })
  .strict();

export type OTPRequestResponseType = z.infer<typeof OTPRequestResponseSchema>;

export const VerifyOTPSchema = z
  .object({
    email: z.email(),
    code: z.string().length(6), // hoặc .regex(/^\d{6}$/)
  })
  .strict();

export type VerifyOTPType = z.infer<typeof VerifyOTPSchema>;

export const OTPVerifyResponseSchema = z
  .object({
    token: z.string(),
    expiresAt: z.string(),
    account: z.object({
      id: z.number().int(),
      name: z.string(),
      email: z.string().email(),
      role: z.enum(["user", "admin", "manager"]),
    }),
  })
  .strict();

export type OTPVerifyResponseType = z.infer<typeof OTPVerifyResponseSchema>;

export const RegisterBody = z
  .object({
    name: z.string().trim().min(2).max(256),
    email: z.email(),
    password: z.string().min(6).max(100),
    confirmPassword: z.string().min(6).max(100),
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Mật khẩu không khớp",
        path: ["confirmPassword"],
      });
    }
  });

export type RegisterBodyType = z.TypeOf<typeof RegisterBody>;

export const RegisterRes = z.object({
  data: z.object({
    token: z.string(),
    expiresAt: z.string(),
    account: z.object({
      id: z.number(),
      name: z.string(),
      email: z.string(),
    }),
  }),
  message: z.string(),
});

export type RegisterResType = z.TypeOf<typeof RegisterRes>;

export const LoginBody = z
  .object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
  })
  .strict();

export type LoginBodyType = z.TypeOf<typeof LoginBody>;

export const LoginRes = RegisterRes;

export type LoginResType = z.TypeOf<typeof LoginRes>;
export const SlideSessionBody = z.object({}).strict();

export type SlideSessionBodyType = z.TypeOf<typeof SlideSessionBody>;
export const SlideSessionRes = RegisterRes;

export type SlideSessionResType = z.TypeOf<typeof SlideSessionRes>;
