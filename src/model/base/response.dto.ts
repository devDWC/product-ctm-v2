// src/shared/dto/api-response.dto.ts
export interface ApiResponse {
  status: number;
  message: string;
  error: string | null;
  isBusinessError: boolean;
  errorDetail: string | null;
  isEncrypted?: boolean | false;
  resultApi: any;
}
