// src/controllers/public/auth.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Route,
  Tags,
} from "tsoa";
import { ApiResponse } from "../../model/base/response.dto";
import {
  ForgotPasswordGoberDto,
  LoginGoberDto,
  RegisterGoberDto,
  UpdateUserInfoGoberDto,
  VerifyOtpGoberDto,
} from "../../model/dto/auth/login.dto";
import {
  Success,
  ExceptionError,
  ProcessError,
  NotfoundError,
} from "../../shared/utils/response.utility";
import { login } from "../../service/mgo-services/users-service/admin/user.service";
import {
  registerGober,
  sendOtpforMultiChannel,
  verifyOTPforMultiChannel,
} from "../../service/mgo-services/auth-service/admin/auth.service";
import {
  SendOtpDto,
  SendOtpGoberDto,
  VerifyOtpDto,
} from "../../model/dto/auth/phone.dto";
import {
  deleteUserPermanentValidate,
  forgotPasswordforMultiChannel,
  forgotPasswordNoOtp,
  getUserByIdPublic,
  updateDynamicUser,
} from "../../service/mgo-services/users-service/public/user.service";
import {
  ChangePasswordMobileDto,
  DeleteUserDto,
  UpdateUserDto,
} from "../../model/dto/user/user.dto";

const API_URL_S3 = process.env.S3_URL;
@Tags("Auth")
@Route("/v1/mobile-app/users")
export class AuthController extends Controller {
  /**
   * @summary Đăng nhập người dùng qua số điện thoại và mật khẩu
   * @description
   * API này cho phép người dùng đăng nhập vào hệ thống Gober bằng số điện thoại và mật khẩu.
   * Nếu thành công sẽ trả về thông tin người dùng và token xác thực để dùng cho các request tiếp theo.
   *
   * @route POST /v1/public/mobile-app/login
   * @param {LoginGoberDto} body.body - Dữ liệu đăng nhập gồm số điện thoại và mật khẩu
   *
   * @returns {ApiResponse} 200 - Trả về token và thông tin người dùng khi đăng nhập thành công
   * @returns {ApiResponse} 400 - Tài khoản bị khóa hoặc lỗi xác thực
   * @returns {ApiResponse} 401 - Mật khẩu không đúng
   * @returns {ApiResponse} 404 - Tài khoản không tồn tại
   * @returns {ApiResponse} 500 - Lỗi hệ thống hoặc lỗi không xác định
   */
  @Post("/login")
  public async login(@Body() body: LoginGoberDto): Promise<ApiResponse> {
    try {
      const { phoneNumber, password } = body;
      const { user, token } = await login(phoneNumber, password, "gober");

      return Success({ user, token }, "Login successfully");
    } catch (error: any) {
      if (error.statusCode === 400) {
        return ProcessError(error.message || "Tài khoản đã bị khóa");
      }

      if (error.statusCode === 404) {
        return NotfoundError(error.message || "Tài khoản không tồn tại");
      }

      if (error.statusCode === 401) {
        return NotfoundError(error.message || "Mật khẩu không đúng");
      }

      return ProcessError("Số điện thoại hoặc mật khẩu không hợp lệ");
    }
  }
  /**
   * @summary Đăng ký người dùng mới với số điện thoại và OTP
   * @description
   * API này cho phép người dùng đăng ký tài khoản mới trên hệ thống Gober bằng số điện thoại, mật khẩu và OTP.
   * Nếu đăng ký thành công, trả về token xác thực để người dùng sử dụng cho các request tiếp theo.
   *
   * @route POST /v1/public/mobile-app/register
   * @param {RegisterGoberDto} body.body - Dữ liệu đăng ký gồm otp, số điện thoại, mật khẩu và kênh gửi OTP
   *
   * @returns {ApiResponse} 200 - Trả về token khi đăng ký thành công
   * @returns {ApiResponse} 400 - OTP không chính xác hoặc không hợp lệ
   * @returns {ApiResponse} 409 - Số điện thoại đã tồn tại trong hệ thống
   * @returns {ApiResponse} 500 - Lỗi hệ thống hoặc lỗi không xác định khi đăng ký
   */
  @Post("/register")
  public async register(@Body() body: RegisterGoberDto): Promise<ApiResponse> {
    try {
      const { otp, phoneNumber, password, channel } = body;

      const { user, token } = await registerGober(
        { otp, phoneNumber, password },
        channel
      );

      return Success({ token }, "Register successfully");
    } catch (error: any) {
      if (error.statusCode === 400) {
        return ProcessError("OTP không chính xác");
      }

      if (error.statusCode === 409) {
        return ProcessError(
          "Số điện thoại đã tồn tại trong hệ thống chợ thông minh, bạn có thể dùng số điện thoại này để đăng nhập vào Gober"
        );
      }

      if (error.message === "Số điện thoại đã tồn tại") {
        return ProcessError(
          "Số điện thoại đã tồn tại, bạn có thể sử dụng số điện thoại này để đăng nhập vào Gober"
        );
      }

      return ProcessError("Lỗi khi đăng ký người dùng");
    }
  }
  /**
   * @summary Gửi mã OTP đến người dùng qua kênh được chỉ định
   * @description
   * API này sẽ gửi mã OTP đến người dùng dựa trên khóa (key) định danh và kênh gửi OTP (sms, email,...).
   * Nếu không có key, trả về lỗi thiếu thông tin bắt buộc.
   *
   * @route POST /v1/public/mobile-app/send-otp
   * @param {SendOtpGoberDto} body.body - Dữ liệu gửi OTP gồm key định danh (số điện thoại hoặc email) và kênh gửi OTP
   *
   * @returns {ApiResponse} 200 - Trả về kết quả gửi OTP thành công
   * @returns {ApiResponse} 400 - Thiếu thông tin bắt buộc (key)
   * @returns {ApiResponse} 404 - Email chưa tồn tại trong hệ thống (nếu kênh là email)
   * @returns {ApiResponse} 500 - Lỗi hệ thống hoặc lỗi khi gửi OTP
   */
  @Post("/send-otp")
  public async sendOtp(@Body() body: SendOtpGoberDto): Promise<ApiResponse> {
    try {
      const { key, channel } = body;
      if (!key) {
        return ProcessError("Thiếu thông tin bắt buộc");
      }

      const sendOtp = await sendOtpforMultiChannel(key, channel);
      return Success(sendOtp, "Gửi OTP thành công");
    } catch (error: any) {
      if (error.message === "Email chưa tồn tại") {
        return ProcessError("Email chưa tồn tại trong hệ thống");
      }
      console.error("Error", error);
      return ProcessError("Lỗi khi gửi OTP");
    }
  }
  /**
   * @summary Xác thực mã OTP người dùng nhập vào
   * @description
   * API này dùng để xác thực mã OTP do người dùng nhập dựa trên key định danh, mã OTP và kênh gửi.
   * Nếu không có key, trả về lỗi thiếu thông tin bắt buộc.
   *
   * @route POST /v1/public/mobile-app/verify-otp
   * @param {VerifyOtpGoberDto} body.body - Dữ liệu xác thực OTP gồm key định danh, mã OTP, và kênh gửi OTP
   *
   * @returns {ApiResponse} 200 - Xác thực OTP thành công
   * @returns {ApiResponse} 400 - Thiếu thông tin bắt buộc (key)
   * @returns {ApiResponse} 404 - Email chưa tồn tại trong hệ thống (nếu kênh là email)
   * @returns {ApiResponse} 500 - Lỗi hệ thống hoặc lỗi khi xác thực OTP
   */
  @Post("/verify-otp")
  public async verifyOtp(
    @Body() body: VerifyOtpGoberDto
  ): Promise<ApiResponse> {
    try {
      const { key, otp, channel } = body;

      if (!key) {
        return ProcessError("Thiếu thông tin bắt buộc");
      }

      const verifyResult = await verifyOTPforMultiChannel(key, otp, channel);

      return Success(verifyResult, "Xác thực OTP thành công");
    } catch (error: any) {
      if (error.message === "Email chưa tồn tại") {
        return ProcessError("Email chưa tồn tại trong hệ thống");
      }
      console.error("Error", error);
      return ProcessError("Lỗi khi xác thực OTP");
    }
  }
  /**
   * @summary Cập nhật thông tin người dùng theo ID
   * @description
   * API này cho phép cập nhật các thông tin người dùng dựa trên ID người dùng truyền vào.
   * Nếu cần, có thể giải mã dữ liệu người dùng được mã hóa bằng AES (đoạn mã giải mã có thể bật/tắt trong code).
   * Dữ liệu cập nhật được ép kiểu về `UpdateUserDto` để đảm bảo tương thích với hàm cập nhật.
   *
   * @route PUT /v1/public/mobile-app/update-user-info/{id}
   * @param {string} id.path - ID người dùng cần cập nhật thông tin
   * @param {UpdateUserInfoGoberDto} body.body - Dữ liệu thông tin người dùng cần cập nhật
   *
   * @returns {ApiResponse} 200 - Trả về dữ liệu người dùng đã được cập nhật thành công
   * @returns {ApiResponse} 404 - Người dùng không tồn tại với ID được cung cấp
   * @returns {ApiResponse} 500 - Lỗi hệ thống hoặc lỗi khi cập nhật thông tin người dùng
   */
  @Put("/update-user-info/:id")
  public async updateUserInfo(
    @Path() id: string,
    @Body() body: UpdateUserInfoGoberDto
  ): Promise<ApiResponse> {
    try {
      // Nếu muốn dùng giải mã AES thì bật phần này
      // const DecryptData = encryptionApi.decryptDataAES(body.userData);
      // const ParseDecrypt = JSON.parse(DecryptData);

      // Ép kiểu body về UpdateUserDto để tương thích
      const updatedUser = await updateDynamicUser(id, body as UpdateUserDto);

      if (updatedUser) {
        return Success(updatedUser, "Cập nhật thông tin người dùng thành công");
      } else {
        return ProcessError("Người dùng không tồn tại");
      }
    } catch (error) {
      console.error("Error", error);
      return ProcessError("Lỗi khi cập nhật người dùng");
    }
  }
  /**
   * @summary Quên mật khẩu - gửi OTP và đặt lại mật khẩu
   * @description
   * API này phục vụ 2 chức năng chính dựa trên tham số `action`:
   * - Gửi OTP đến số điện thoại hoặc email (action = "sendOtp")
   * - Xác thực OTP và đặt lại mật khẩu mới (action = "resetPassword" hoặc các giá trị khác)
   *
   * Tham số đường dẫn `phoneOrEmail` có thể là số điện thoại hoặc email của người dùng.
   * Tham số `channel` xác định kênh gửi OTP (mặc định là "auto").
   *
   * @route PUT /v1/public/mobile-app/forgot-password/{phoneOrEmail}
   * @param {string} phoneOrEmail.path - Số điện thoại hoặc email người dùng cần gửi OTP hoặc đặt lại mật khẩu
   * @param {ForgotPasswordGoberDto} body.body - Dữ liệu gồm:
   *   - action (string): Hành động "sendOtp" để gửi OTP hoặc "resetPassword" để đặt mật khẩu mới
   *   - channel (string, optional): Kênh gửi OTP, mặc định "auto"
   *   - otp (string, required khi đặt lại mật khẩu): Mã OTP xác thực
   *   - newPassword (string, required khi đặt lại mật khẩu): Mật khẩu mới muốn đặt
   *
   * @returns {ApiResponse} 200 - Trả về kết quả thành công (gửi OTP hoặc đặt lại mật khẩu)
   * @returns {ApiResponse} 400 - Thiếu thông tin bắt buộc hoặc dữ liệu không hợp lệ
   * @returns {ApiResponse} 500 - Lỗi hệ thống hoặc lỗi không xác định
   */
  @Put("/forgot-password/:phoneOrEmail")
  public async forgotPassword(
    @Path() phoneOrEmail: string,
    @Body() body: ForgotPasswordGoberDto
  ): Promise<ApiResponse> {
    try {
      const { action, channel = "auto", otp, newPassword } = body; // channel luôn có giá trị

      if (!action) {
        return ProcessError("Thiếu thông tin action");
      }

      if (action === "sendOtp") {
        const result = await forgotPasswordforMultiChannel(
          {
            input: phoneOrEmail,
            channel,
          },
          action
        );
        return Success(result, "Gửi OTP thành công");
      }

      if (!otp || !newPassword) {
        return ProcessError("Thiếu thông tin cần thiết để đặt lại mật khẩu");
      }

      const result = await forgotPasswordforMultiChannel(
        {
          otp,
          newPassword,
          phoneOrEmail,
          channel,
        },
        action
      );

      return Success(result, "Đặt lại mật khẩu thành công");
    } catch (error: any) {
      console.error("Error", error);
      return ProcessError(error.message || "Lỗi hệ thống");
    }
  }
  /**
   * @summary Lấy thông tin người dùng công khai theo ID
   * @description
   * API này dùng để truy xuất thông tin người dùng dựa trên ID.
   * Trường `avatar` nếu có sẽ được chuyển thành đường dẫn đầy đủ tới ảnh lưu trên S3.
   * Nếu không tìm thấy người dùng với ID cung cấp, API sẽ trả về lỗi 404.
   *
   * @route GET /v1/public/mobile-app/{id}
   * @param {string} id.path - ID người dùng cần lấy thông tin
   *
   * @returns {ApiResponse} 200 - Trả về thông tin người dùng, bao gồm trường image_url_map chứa URL avatar
   * @returns {ApiResponse} 404 - Người dùng không tồn tại
   * @returns {ApiResponse} 500 - Lỗi hệ thống hoặc lỗi không xác định
   */
  @Get("/:id")
  public async getUserByIdPublic(
    @Path() id: string // dùng Path để nhận param từ URL
  ): Promise<ApiResponse> {
    try {
      const user = await getUserByIdPublic(id);

      if (!user) {
        return NotfoundError();
      }

      const updatedData = {
        ...user,
        image_url_map: user.avatar
          ? `${API_URL_S3}/chothongminh/user/${user.id}/${user.avatar}`
          : null,
      };
      return Success(updatedData, "Lấy thông tin thành công");
    } catch (error) {
      console.error("Error", error);
      return ProcessError("Lỗi khi lấy thông tin người dùng");
    }
  }

  /**
   * @summary Xóa người dùng vĩnh viễn theo ID
   * @description
   * API này cho phép xóa người dùng một cách vĩnh viễn dựa trên ID và yêu cầu xác thực bằng mật khẩu.
   * Nếu mật khẩu không đúng hoặc người dùng không tồn tại, API sẽ trả lỗi tương ứng.
   *
   * @route DELETE /v1/public/mobile-app/{id}
   * @param {string} id.path - ID người dùng cần xóa
   * @param {DeleteUserDto} body.body - Dữ liệu body chứa mật khẩu xác thực
   *
   * @returns {ApiResponse} 200 - Xóa người dùng thành công
   * @returns {ApiResponse} 400 - Mật khẩu không đúng hoặc dữ liệu không hợp lệ
   * @returns {ApiResponse} 404 - Người dùng không tồn tại
   * @returns {ApiResponse} 500 - Lỗi hệ thống
   */
  @Delete("/:id")
  public async deleteUserPermanent(
    @Path() id: string,
    @Body() body: DeleteUserDto
  ): Promise<ApiResponse> {
    try {
      const result = await deleteUserPermanentValidate(id, body.password);

      return Success(result, "Xóa người dùng thành công");
    } catch (error: any) {
      console.error("Error deleting user:", error);

      if (error.statusCode === 400) {
        return ProcessError(error.message, 400);
      }
      if (error.statusCode === 404) {
        return ProcessError(error.message, 404);
      }

      return ProcessError("Đã xảy ra lỗi trong quá trình xóa người dùng.");
    }
  }

  /**
   * @summary Đổi mật khẩu cho người dùng theo ID
   * @description
   * API cho phép người dùng đổi mật khẩu mà không cần OTP, yêu cầu cung cấp mật khẩu mới hợp lệ.
   * Nếu xảy ra lỗi xác thực hoặc lỗi hệ thống, API sẽ trả về mã lỗi phù hợp.
   *
   * @route POST /v1/public/mobile-app/change-password/{id}
   * @param {string} id.path - ID người dùng cần đổi mật khẩu
   * @param {ChangePasswordMobileDto} body.body - Dữ liệu body chứa mật khẩu mới và các thông tin liên quan
   *
   * @returns {ApiResponse} 200 - Đổi mật khẩu thành công
   * @returns {ApiResponse} 400|401|403 - Lỗi xác thực hoặc dữ liệu không hợp lệ
   * @returns {ApiResponse} 500 - Lỗi hệ thống
   */
  @Post("/change-password/:id")
  public async changePassword(
    @Path() id: string,
    @Body() body: ChangePasswordMobileDto
  ): Promise<ApiResponse> {
    try {
      const result = await forgotPasswordNoOtp(id, body);
      return Success(result, "Đổi mật khẩu thành công");
    } catch (error: any) {
      console.error("Error changing password:", error);
      if (error.statusCode) {
        return ProcessError(error.message, error.statusCode);
      }
      return ProcessError("Lỗi hệ thống");
    }
  }
}
