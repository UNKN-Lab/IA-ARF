import http from "@/lib/http";
import {
  OTPRequestResponseType,
  OTPVerifyResponseType,
  RequestOTPType,
  VerifyOTPType,
} from "@/schemaValidation/auth.schema";

const authApiRequest = {
  request: (body: RequestOTPType) =>
    http.post<OTPRequestResponseType>("/auth/email/request-otp", body),
  verify: (body: VerifyOTPType) =>
    http.post<OTPVerifyResponseType>("/auth/email/verify-otp", body),
};

export default authApiRequest;
