import { v4 as uuidv4 } from "uuid";
import {
  CreateUserDto,
  UpdateUserDto,
  UserStats,
} from "../../../../model/dto/user/user.dto";
import { UserContext } from "../../../../model/entities/user.entities";
import { generatePrivateKey } from "../../../../shared/helper/support.service";
import { buildMongoQuery } from "../../../../shared/utils/mgo.utility";
import { normalizePhone } from "../../../../shared/utils/phone.utility";
import { createToken } from "../../../../shared/utils/jwt.utility";

import bcrypt from "bcryptjs";

export async function createUser(user: CreateUserDto) {
  const {
    emailAddress,
    firstName,
    lastName,
    phoneNumber,
    address,
    points,
    status,
    password,
    listTenant,
    userCreate,
    userUpdate,
    role,
  } = user;
  const phoneNumberFormat: any = normalizePhone(phoneNumber);
  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = new UserContext({
    id: uuidv4(),
    emailAddress,
    firstName,
    lastName,
    fullName: `${firstName || ""} ${lastName || ""}`,
    phoneNumber: phoneNumberFormat,
    address,
    points: parseInt(points?.toString() || "0"),
    status: status || "active",
    passwordHash,
    listTenant,
    userCreate,
    userUpdate,
    role: parseInt(role?.toString() || "0"),
    privateKey: generatePrivateKey(),
  });

  return await newUser.save();
}

export async function getUsers(
  search: string,
  pageCurrent: number,
  pageSize: number,
  sortList: { key: string; value: "asc" | "desc" }[] = []
): Promise<{ users: any[]; totalUsers: number }> {
  const { filter, sort } = buildMongoQuery({
    search,
    searchKeys: ["emailAddress", "phoneNumber"],
    sortList,
    defaultSort: { updateDate: -1 },
    baseFilter: {},
  });

  const skip = (pageCurrent - 1) * pageSize;
  const limit = pageSize;

  const [listData, total] = await Promise.all([
    UserContext.find(filter)
      .select("-passwordHash")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    UserContext.countDocuments(filter),
  ]);

  return {
    users: listData,
    totalUsers: total,
  };
}

export async function getUserById(id: string): Promise<any | null> {
  const user = await UserContext.findOne(
    { id },
    {
      passwordHash: 0,
      __v: 0,
    }
  )
    .select(["-passwordHash", "-privateKey"])
    .lean(); // chỉ định kiểu dữ liệu trả về

  return user;
}

export async function updateUser(id: string, user: UpdateUserDto) {
  const {
    emailAddress,
    firstName,
    lastName,
    phoneNumber,
    address,
    points,
    status,
    userUpdate,
    password,
    listTenant,
    role,
  } = user;

  const phoneNumberFormat: any = normalizePhone(phoneNumber);
  const data = {
    emailAddress,
    firstName,
    lastName,
    fullName: `${firstName || ""} ${lastName || ""}`.trim(),
    phoneNumber: phoneNumberFormat,
    address,
    points: points ? parseInt(points as any, 10) : 0,
    status,
    listTenant,
    userUpdate,
    role: role ? parseInt(role as any, 10) : 0,
  } as any;

  if (password) {
    data.passwordHash = await bcrypt.hash(password, 10);
    data.privateKey = generatePrivateKey();
  }

  const updatedUser = await UserContext.findOneAndUpdate(
    { id },
    { $set: data },
    { new: true, runValidators: true }
  )
    .select("-passwordHash")
    .lean();

  return updatedUser;
}

export async function login(
  emailOrPhone: string,
  password: string,
  key: string = "chothongminh"
): Promise<any | null> {
  let phoneNormalized: string | null = null;
  const query: any[] = [];

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
  // if (!user) {
  //   const err = new Error("Tài khoản không tồn tại") as Error & { statusCode?: number };
  //   err.statusCode = 404;
  //   throw err;
  // }

  // if (user?.status === "block") {
  //   const err = new Error("Tài khoản đã bị khóa") as Error & { statusCode?: number };
  //   err.statusCode = 400;
  //   throw err;
  // }

  if (!user) return null;

  const passwordMatch = await bcrypt.compare(password, user.passwordHash || "");

  // Tạm thời bỏ kiểm tra lỗi
  // if (!passwordMatch) {
  //   const err = new Error("Mật khẩu không đúng, vui lòng thử lại") as Error & { statusCode?: number };
  //   err.statusCode = 401;
  //   throw err;
  // }

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

//đổi điểm cho user - api admin
export async function exchangePointUser(
  userId: string,
  point: any
): Promise<any | (Document & { points: number }) | null> {
  try {
    const userInfo = await UserContext.findOne({ id: userId });

    if (!userInfo) {
      return {
        status: 404,
        message: "Không tìm thấy người dùng",
      };
    }

    const currentPoints = parseInt((userInfo.points ?? 0).toString(), 10);

    const requiredPoints = parseInt(
      point.voucher?.number1?.toString() ?? "0",
      10
    );

    if (currentPoints < requiredPoints) {
      return {
        status: 400,
        message: "Điểm của bạn không đủ để đổi voucher này",
      };
    }

    const updatedUser = await UserContext.findOneAndUpdate(
      { id: userId },
      { points: currentPoints - requiredPoints },
      { new: true }
    );

    return updatedUser;
  } catch (error) {
    console.error("Error exchanging user point:", error);
    return {
      status: 500,
      message: "Đã xảy ra lỗi khi đổi điểm",
    };
  }
}

export async function getUserPoint(userId: string, point: any): Promise<any> {
  try {
    const userInfo = await UserContext.findOne({ id: userId });

    if (!userInfo) {
      return {
        status: 404,
        message: "Không tìm thấy người dùng",
      };
    }

    const userPoints = parseInt((userInfo.points ?? 0).toString(), 10);
    const requiredPoints = parseInt(
      point.voucher?.number1?.toString() ?? "0",
      10
    );

    if (userPoints < requiredPoints) {
      return {
        status: 400,
        message: "Điểm của bạn không đủ để đổi voucher này",
      };
    }

    return {
      status: 200,
      message: "Bạn có thể sử dụng voucher này",
    };
  } catch (error) {
    console.error("Error checking user point:", error);
    return {
      status: 500,
      message: "Lỗi hệ thống khi kiểm tra điểm người dùng",
    };
  }
}

export async function getUserStatsThisMonth(
  tenantId?: number
): Promise<UserStats> {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0); // ngày cuối tháng trước

  const baseFilter: Record<string, any> = { isDeleted: false };

  // Nếu có tenantId thì thêm vào filter
  if (tenantId) {
    baseFilter.tenantId = tenantId;
  }

  const thisMonthCount = await UserContext.countDocuments({
    ...baseFilter,
    createDate: { $gte: startOfThisMonth },
  });

  console.log("dấdada", thisMonthCount);

  const lastMonthCount = await UserContext.countDocuments({
    ...baseFilter,
    createDate: { $gte: startOfLastMonth, $lte: endOfLastMonth },
  });

  let percentChangeCurrent = 0;
  if (lastMonthCount > 0) {
    percentChangeCurrent =
      ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100;
  } else if (thisMonthCount > 0) {
    percentChangeCurrent = 100;
  }

  let percentChangeLast = 0;
  if (thisMonthCount > 0) {
    percentChangeLast =
      ((lastMonthCount - thisMonthCount) / thisMonthCount) * 100;
  } else if (lastMonthCount > 0) {
    percentChangeLast = 100;
  }

  return {
    totalUsersThisMonth: thisMonthCount,
    totalUsersLastMonth: lastMonthCount,
    percentChangeCurrent: parseFloat(percentChangeCurrent.toFixed(2)),
    percentChangeLast: parseFloat(percentChangeLast.toFixed(2)),
    trend:
      percentChangeCurrent > 0
        ? "increase"
        : percentChangeCurrent < 0
        ? "decrease"
        : "no change",
  };
}

export async function checkValidPhoneNumber(
  phoneNumber: string
): Promise<boolean> {
  try {
    console.log("djahsdasd", phoneNumber);
    const phoneFormat = normalizePhone(phoneNumber);
    const existingUser = await UserContext.findOne({
      phoneNumber: phoneFormat,
    });

    if (existingUser) {
      return true;
    }

    return false;
  } catch (error: any) {
    console.error("Error checking phone number:", error.message);
    throw error;
  }
}
