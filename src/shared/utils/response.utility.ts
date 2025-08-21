// src/shared/utils/response-helper.ts
import { ApiResponse } from "../../model/base/response.dto";

export function Success(result: any, message = "Process success"): ApiResponse {
  return {
    status: 200,
    message,
    error: null,
    isBusinessError: false,
    errorDetail: null,
    resultApi: result,
    isEncrypted: false,
  };
}
export function SuccessEncrypted(
  result: any,
  message = "Process success"
): ApiResponse {
  return {
    status: 200,
    message,
    error: null,
    isBusinessError: false,
    errorDetail: null,
    isEncrypted: true,
    resultApi: result,
  };
}
export function ProcessError(
  message = "Error",
  status: number = 400,
  error?: string,
  errorDetail: string = ""
): ApiResponse {
  return {
    status,
    message,
    error: error || "Internal Server Error",
    isBusinessError: true,
    errorDetail: errorDetail,
    resultApi: null,
    isEncrypted: false,
  };
}

export function NotfoundError(
  message = "Notfound",
  status: number = 404,
  error?: string,
  errorDetail: string = ""
): ApiResponse {
  return {
    status,
    message,
    error: error || "Not found",
    isBusinessError: true,
    errorDetail: errorDetail,
    resultApi: null,
    isEncrypted: false,
  };
}

export function ConflictError(
  message = "Conflict",
  status: number = 409,
  error?: string,
  errorDetail: string = ""
): ApiResponse {
  return {
    status,
    message,
    error: error || "Conflict",
    isBusinessError: true,
    errorDetail: errorDetail,
    resultApi: null,
    isEncrypted: false,
  };
}

export function ExceptionError(message = "Internal Server Error"): ApiResponse {
  return {
    status: 500,
    message,
    error: "Exception Error",
    isBusinessError: false,
    errorDetail: "002",
    resultApi: null,
    isEncrypted: false,
  };
}
