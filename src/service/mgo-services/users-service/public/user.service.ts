import { v4 as uuidv4 } from "uuid";
import {
  CreateUserDto,
  UpdateUserDto,
  GetUserByIdPublicDto,
  FindUserInput,
  updateEmailOrPhoneDto,
  getUserWithLevelDto,
  getUserPoints,
  ForgotPasswordData,
  ForgotPasswordDataMobile,
} from "../../../../model/dto/user/user.dto";
import { UserContext, IUser } from "../../../../model/entities/user.entities";
import { TenantContext } from "../../../../model/entities/tenant.entities";
import { generatePrivateKey } from "../../../../shared/helper/support.service";
import { buildMongoQuery } from "../../../../shared/utils/mgo.utility";
import { normalizePhone } from "../../../../shared/utils/phone.utility";
import { createToken } from "../../../../shared/utils/jwt.utility";
import { TenantRandom } from "../../../../model/dto/tenant/tenant.dto";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import {
  RegisterInputDto,
  RegisterOutputDto,
} from "../../../../model/dto/auth/register.dto";
import {
  sendOtpforMultiChannel,
  verifyOTPforMultiChannel,
} from "../../auth-service/admin/auth.service";
import bcrypt from "bcryptjs";
// Khai báo client Google OAuth2
const client = new OAuth2Client(
  "24112780746-hmhbngj3j7j7ojfa3cna20k95c3hebvh.apps.googleusercontent.com"
);

export async function login(
  emailOrPhone: string,
  password: string,
  key: string = "chothongminh"
): Promise<any | null> {
  let phoneNormalized: string | null = null;
  const query: any[] = [];
  if (!emailOrPhone) {
    throw new Error("Thiếu số điện thoại");
  }
  // Nếu là số điện thoại thì chuẩn hóa
  if (/^\+?\d{9,15}$/.test(emailOrPhone.replace(/\s/g, ""))) {
    phoneNormalized = normalizePhone(emailOrPhone);
    if (phoneNormalized) {
      query.push({ phoneNumber: phoneNormalized });
    }
  }

  // Luôn thêm điều kiện tìm qua email
  query.push({ emailAddress: emailOrPhone });

  const user = await UserContext.findOne({ $or: query });

  // Tạm thời bỏ kiểm tra lỗi
  if (!user) {
    const err = new Error("Tài khoản không tồn tại") as Error & {
      statusCode?: number;
    };
    err.statusCode = 404;
    throw err;
  }

  if (user?.status === "block") {
    const err = new Error("Tài khoản đã bị khóa") as Error & {
      statusCode?: number;
    };
    err.statusCode = 400;
    throw err;
  }

  if (!user) return null;

  const passwordMatch = await bcrypt.compare(password, user.passwordHash || "");

  // Tạm thời bỏ kiểm tra lỗi
  if (!passwordMatch) {
    const err = new Error("Mật khẩu không đúng, vui lòng thử lại") as Error & {
      statusCode?: number;
    };
    err.statusCode = 401;
    throw err;
  }

  if (!passwordMatch) return null;

  const token = await createToken(user, key);

  return {
    user,
    token,
    message: `Tài khoản đã tồn tại trong hệ thống ${
      user.originSystem || "chothongminh.com"
    }`,
  };
}

export async function register(
  user: RegisterInputDto
): Promise<RegisterOutputDto> {
  try {
    const {
      otp,
      emailAddress,
      firstName,
      lastName,
      phoneNumber,
      address,
      password,
      channel,
    } = user;

    const phoneNumberFormat = normalizePhone(phoneNumber);

    // const check = await authService.verifyOTPforMultiChannel(
    //   phoneNumberFormat,
    //   otp,
    //   channel
    // );

    // if (!check.status) {
    //   const err = new Error("OTP không hợp lệ") as Error & {
    //     code?: string;
    //     statusCode?: number;
    //   };
    //   err.code = "INVALID_OTP";
    //   err.statusCode = 400;
    //   throw err;
    // }

    const existingUser = await UserContext.findOne({
      phoneNumber: phoneNumberFormat,
    });
    if (existingUser) {
      const err = new Error(
        "Số điện thoại đã tồn tại, bạn có thể dùng số điện thoại này để đăng nhập vào hệ thống"
      ) as Error & {
        code?: string;
        statusCode?: number;
      };
      err.code = "CONFLICT";
      err.statusCode = 409;
      throw err;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userData = {
      id: uuidv4(),
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      phoneNumber: phoneNumberFormat,
      address,
      passwordHash,
      privateKey: generatePrivateKey(),
      originSystem: "chothongminh.com",
    };

    const newUser = new UserContext(userData);
    await newUser.save();

    const token = createToken(newUser);

    return { user: newUser.toObject(), token };
  } catch (error) {
    console.error("Error in register:", error);
    throw error;
  }
}

//public function
export async function updateDynamicUser(
  userId: string,
  data: UpdateUserDto
): Promise<any> {
  try {
    // Tách các field không được update trực tiếp
    const { password, role, listTenant, status, ...filteredData } = data;
    if (filteredData.phoneNumber) {
      const normalizedPhone = normalizePhone(filteredData.phoneNumber); // string | null
      filteredData.phoneNumber = normalizedPhone ?? undefined;
    }

    // Cập nhật user
    const updatedUser = await UserContext.findOneAndUpdate(
      { id: userId },
      { $set: filteredData },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error("Không tìm thấy người dùng.");
    }

    return updatedUser;
  } catch (err) {
    console.error("Lỗi khi cập nhật người dùng:", err);
    throw err;
  }
}

export async function getListAddressUserById(id: string): Promise<any> {
  const user = await UserContext.findOne({ id })
    .select("listAddress -_id")
    .lean();

  return {
    listAddress: user?.listAddress || null,
  };
}

export async function getUserByIdPublic(
  id: string
): Promise<GetUserByIdPublicDto | null> {
  const user = await UserContext.findOne(
    { id },
    {
      id: 1,
      emailAddress: 1,
      firstName: 1,
      lastName: 1,
      fullName: 1,
      phoneNumber: 1,
      address: 1,
      points: 1,
      status: 1,
      defaultTenant: 1,
      defaultAddress: 1,
      role: 1,
      CodeAddress: 1,
      rule: 1,
      avatar: 1,
    }
  ).lean();

  return user as GetUserByIdPublicDto | null; // hoặc throw error nếu muốn
}

export async function findUserWithEmailOrPhone(
  data: FindUserInput
): Promise<any> {
  if (data.emailAddress && data.emailAddress.trim() !== "") {
    const user = await UserContext.findOne({
      emailAddress: data.emailAddress,
    }).lean();
    if (user) return user;

    return {
      status: 404,
      message: "User không tồn tại",
    };
  }

  if (data.phoneNumber && data.phoneNumber.trim() !== "") {
    const phoneNumberFormat: any = normalizePhone(data.phoneNumber);
    const user = await UserContext.findOne({
      phoneNumber: phoneNumberFormat,
    }).lean();
    if (user) return user;

    return {
      status: 404,
      message: "User không tồn tại",
    };
  }

  return {
    status: 400,
    message: "Vui lòng cung cấp email hoặc số điện thoại",
  };
}

export async function updateLatvsLngUser(
  userId: string,
  lng: number,
  lat: number
): Promise<any> {
  const updatedUser = await UserContext.findOneAndUpdate(
    { id: userId }, // tìm theo trường 'id'
    {
      $set: {
        lng: lng,
        lat: lat,
      },
    },
    { new: true } // Trả về document sau khi update
  );
  if (updatedUser) {
    return {
      status: 200,
      message: "oke cập nhật vị trí thành công",
    };
  } else {
    return {
      status: 400,
      message: "oke cập nhật vị trí lỗi rồi",
    };
  }
}

export async function updateEmailOrPhoneNumber(
  userId: string,
  otp: number | string,
  phoneNumber?: string,
  emailAddress?: string
): Promise<updateEmailOrPhoneDto> {
  try {
    const identifier = phoneNumber || emailAddress;
    if (!identifier) {
      throw new Error("Phải cung cấp emailAddress hoặc phoneNumber");
    }

    // 1. Xác minh OTP trước
    // const check = await authService.verifyOTP(identifier, parseInt(otp as string));
    // if (!check) {
    //   const err: any = new Error("Otp không hợp lệ hoặc đã hết hạn");
    //   err.statusCode = 400;
    //   throw err;
    // }

    // 2. Xác định trường cần cập nhật
    const updateFields: Partial<updateEmailOrPhoneDto> = {};
    if (phoneNumber) {
      updateFields.phoneNumber = phoneNumber;
    }
    if (emailAddress) {
      updateFields.emailAddress = emailAddress;
    }

    // 3. Cập nhật người dùng
    const updatedUser = await UserContext.findOneAndUpdate(
      { id: userId },
      { $set: updateFields },
      { new: true }
    ).lean();

    return (updatedUser as updateEmailOrPhoneDto) || null;
  } catch (err) {
    console.error("Lỗi khi cập nhật người dùng:", err);
    throw err;
  }
}

export async function getTenantOrRandom(id?: number): Promise<TenantRandom> {
  let tenant = await TenantContext.findOne({ id: id }).lean();

  if (!tenant) {
    const allTenants = await TenantContext.find().lean();
    if (allTenants.length === 0) {
      throw new Error("Không có tenant nào trong hệ thống.");
    }

    // Lấy ngẫu nhiên 1 tenant
    const randomIndex = Math.floor(Math.random() * allTenants.length);
    tenant = allTenants[randomIndex];
  }

  return tenant;
}

export async function getUsersForComment(
  search?: string,
  pageCurrent: number = 1,
  pageSize: number = 10,
  sortList?: any
): Promise<{
  users: getUserWithLevelDto[];
  totalUsers: number;
}> {
  const { filter, sort } = buildMongoQuery({
    search,
    searchKeys: ["emailAddress", "phoneNumber"],
    sortList,
    defaultSort: { updateDate: -1 },
    baseFilter: { status: "active" },
  });

  const skip = (pageCurrent - 1) * pageSize;
  const limit = pageSize;

  const [listData, total] = await Promise.all([
    UserContext.find(filter)
      .select("fullName phoneNumber points id")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean<getUserPoints[]>(),
    UserContext.countDocuments(filter),
  ]);

  const usersWithLevel: getUserWithLevelDto[] = listData.map((user) => {
    const point = user?.points || 0;
    let level = 0;

    if (point > 1000) level = 4;
    else if (point > 500) level = 3;
    else if (point > 200) level = 2;
    else if (point > 100) level = 1;

    const { points, ...rest } = user;
    return {
      ...rest,
      level,
    };
  });

  return {
    users: usersWithLevel,
    totalUsers: total,
  };
}

export async function forgotPasswordforMultiChannel(
  data: ForgotPasswordData,
  action: string | null = null
): Promise<any> {
  if (action === "sendOtp") {
    if (!data.input) {
      throw new Error("Thiếu thông tin input để gửi OTP");
    }
    await sendOtpforMultiChannel(data.input, data.channel);
    return { status: 200, message: "Gửi otp xác nhận thành công" };
  }

  try {
    const { otp, newPassword, phoneOrEmail, channel } = data;

    if (!otp || !newPassword || !phoneOrEmail) {
      throw new Error("Thiếu thông tin cần thiết để đặt lại mật khẩu");
    }

    const check = await verifyOTPforMultiChannel(phoneOrEmail, otp, channel);

    if (!check.status) {
      const err = new Error("OTP không hợp lệ") as Error & {
        code?: string;
        statusCode?: number;
      };
      err.code = "INVALID_OTP";
      err.statusCode = 400;
      throw err;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const isEmail = phoneOrEmail.includes("@");
    const condition = isEmail
      ? { emailAddress: phoneOrEmail }
      : { phoneNumber: phoneOrEmail };

    await UserContext.findOneAndUpdate(
      condition,
      { $set: { passwordHash, privateKey: generatePrivateKey() } },
      { new: true }
    );

    return { status: 200, message: "Mật khẩu đã được cập nhật thành công" };
  } catch (error) {
    console.log("Error in reset password:", error);
    throw error;
  }
}

export async function verifyGoogleToken(
  ggToken: string | null = null
): Promise<any> {
  try {
    // Xác minh token với Google
    if (!ggToken) {
      throw new Error("Google token không được để trống");
    }

    const ticket = await client.verifyIdToken({
      idToken: ggToken,
      audience:
        "24112780746-hmhbngj3j7j7ojfa3cna20k95c3hebvh.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload() as TokenPayload;
    if (!payload?.email) {
      throw new Error("Không lấy được email từ Google token");
    }

    const emailAddress = payload.email;
    let user = await UserContext.findOne({ emailAddress }).lean<IUser>();
    let token: string;
    let statusUser: "LOGIN" | "REGISTER";

    if (user) {
      if (user.status === "block") {
        throw new Error("Tài khoản đã bị khóa");
      }
      // Người dùng đã tồn tại -> Tạo JWT
      token = await createToken(user);
      statusUser = "LOGIN";
    } else {
      // Người dùng chưa tồn tại -> Tạo mới
      const newUser = await UserContext.create({
        emailAddress: payload.email,
        firstName: payload.given_name || "",
        lastName: payload.family_name || "",
        fullName: `${payload.given_name || ""} ${
          payload.family_name || ""
        }`.trim(),
        phoneNumber: "",
        address: "",
        points: 0,
        status: "A",
        passwordHash: "",
        listTenant: [],
        role: 0,
        privateKey: generatePrivateKey(),
        createdAt: new Date(),
      });
      user = newUser.toObject() as IUser;
      token = await createToken(user);
      statusUser = "REGISTER";
    }

    console.log("Google token verified successfully", user._id || user.id);
    return { user, token, statusUser };
  } catch (error) {
    console.error("Google token verification failed", error);
    throw new Error("Google token verification failed");
  }
}
export async function deleteUserPermanentValidate(
  id: string,
  password: string
): Promise<any> {
  try {
    const result = await UserContext.findOne({ id }); // Xóa theo UUID
    if (result) {
      if (!result.passwordHash) {
        const err: any = new Error("PASSWORD_HASH_MISSING");
        err.code = "HASH_MISSING";
        err.statusCode = 500;
        throw err;
      }
      const isPasswordCorrect = await bcrypt.compare(
        password,
        result.passwordHash as string
      );
      if (!isPasswordCorrect) {
        const err: any = new Error("PASSWORD INCORRECT");
        err.code = "INCORRECT";
        err.statusCode = 400;
        throw err;
      }
      const deletedUser = await UserContext.findOneAndDelete({ id });
      return deletedUser || null;
    } else {
      const err: any = new Error("USER_NOT_FOUND");
      err.code = "NOT_FOUND"; // mã lỗi tùy chỉnh
      err.statusCode = 404; // mã HTTP
      throw err;
    }
  } catch (error: any) {
    console.error("Error deleting user:", error.message);
    throw error; // giữ nguyên lỗi gốc
  }
}
export async function forgotPasswordNoOtp(
  id: string,
  data: ForgotPasswordDataMobile
): Promise<{ status: number; message: string }> {
  try {
    const { newPassword } = data;
    const passwordHash = await bcrypt.hash(newPassword, 10);

    const updatedUser = await UserContext.findOneAndUpdate(
      { id },
      {
        $set: {
          passwordHash,
          privateKey: generatePrivateKey(),
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      const err: any = new Error("User not found");
      err.code = "NOT_FOUND";
      err.statusCode = 404;
      throw err;
    }

    return {
      status: 200,
      message: "Mật khẩu đã được cập nhật thành công",
    };
  } catch (error: any) {
    console.error("Error in forgotPasswordNoOtp:", error);
    throw error;
  }
}
