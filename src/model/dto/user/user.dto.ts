export interface CreateUserDto {
  emailAddress: string;
  firstName: string;
  lastName: string;
  fullName?: string; // tự động ghép nếu không có
  phoneNumber?: string;
  address?: string;
  points?: number;
  status: string;
  password: string;
  listTenant: string;
  userCreate?: number;
  userUpdate?: number;
  role: number;
}

export interface UpdateUserDto {
  emailAddress: string;
  firstName: string;
  lastName: string;
  fullName?: string; // tự động ghép nếu không có
  phoneNumber?: string;
  address?: string;
  points?: number;
  status: string;
  password: string;
  listTenant: string;
  userCreate?: number;
  userUpdate?: number;
  role: number;
}

export interface GetUserDto {
  id: string;
  emailAddress: string;
  firstName: string;
  lastName: string;
  fullName?: string; // tự động ghép nếu không có
  phoneNumber?: string;
  address?: string;
  points?: number;
  status: string;
  password: string;
  privateKey: string;
  listTenant: string;
  userCreate?: number;
  userUpdate?: number;
  role: number;
}

export interface UserStats {
  totalUsersThisMonth: number;
  totalUsersLastMonth: number;
  percentChangeCurrent: number;
  percentChangeLast: number;
  trend: "increase" | "decrease" | "no change";
}

export interface GetUserByIdPublicDto {
  id: string;
  emailAddress: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  address: string | null;
  points: number;
  defaultTenant: string;
  defaultAddress: string | null;
  CodeAddress: string | null;
  avatar: string | null;
}

export interface FindUserInput {
  emailAddress?: string;
  phoneNumber?: string;
}

export interface UpdateLocationDto {
  lat: number;
  lng: number;
}

export interface updateEmailOrPhoneDto {
  id: string;
  emailAddress?: string;
  phoneNumber?: string;
}

export interface InputupdateEmailOrPhoneDto {
  id: string;
  otp: string;
  emailAddress?: string;
  phoneNumber?: string;
}

export interface getUserWithLevelDto {
  id: string;
  fullName: string;
  phoneNumber: string;
  level: number;
}

export interface getUserPoints {
  id: string;
  fullName: string;
  phoneNumber: string;
  points?: number;
}

export interface ForgotPasswordData {
  input?: string;
  /**
   * @example "zns"
   * @enum ["auto", "email", "sms", "zns"]
   */
  channel: "auto" | "email" | "sms" | "zns";
  otp?: string;
  newPassword?: string;
  userId?: string;
  phoneOrEmail?: string;
}

export interface ForgotPasswordInputDto {
  input?: string;
  /**
   * @example "zns"
   * @enum ["auto", "email", "sms", "zns"]
   */
  channel: "auto" | "email" | "sms" | "zns";
  otp?: string;
  newPassword?: string;
  userId?: string;
  phoneOrEmail?: string;
  action?: string;
}
export interface DeleteUserDto {
  password: string;
}
export interface ChangePasswordMobileDto {
  oldPassword: string;
  newPassword: string;
}
export interface ForgotPasswordDataMobile {
  newPassword: string;
}

export interface GetUserRequest {
  search?: string;
  pageCurrent?: number | string;
  pageSize?: number | string;
  sortList?: any[];
}
