// src/controllers/public/auth.controller.ts

import { Body, Controller, Delete, Get, Path, Post, Route, Tags } from "tsoa";
import { ApiResponse } from "../../model/base/response.dto";
import { Success, ProcessError, NotfoundError } from "../../shared/utils/response.utility";
import {
  deleteUserPermanentValidate,
  forgotPasswordNoOtp,
  getUserByIdPublic,
} from "../../service/mgo-services/users-service/public/user.service";
import { ChangePasswordMobileDto, DeleteUserDto } from "../../model/dto/user/user.dto";

const API_URL_S3 = process.env.S3_URL;

@Tags("Auth")
@Route("/v1/mobile-app/users")
export class AuthController extends Controller {
  /**
   * @summary Lấy thông tin người dùng công khai theo ID
   * @description
   * Trường `avatar` nếu có sẽ được chuyển thành đường dẫn đầy đủ tới ảnh lưu trên S3.
   * Nếu không tìm thấy người dùng, trả về lỗi 404.
   *
   * @param {string} id.path - ID người dùng cần lấy thông tin
   */
  @Get("/:id")
  public async getUserByIdPublic(@Path() id: string): Promise<ApiResponse> {
    try {
      const user = await getUserByIdPublic(id);

      if (!user) return NotfoundError();

      const updatedData = {
        ...user,
        image_url_map: user.avatar
          ? `${API_URL_S3}/chothongminh/user/${user.id}/${user.avatar}`
          : null,
      };

      return Success(updatedData, "Lấy thông tin thành công");
    } catch (error) {
      console.error("Error getting user:", error);
      return ProcessError("Lỗi khi lấy thông tin người dùng");
    }
  }

  /**
   * @summary Xóa người dùng vĩnh viễn theo ID
   * @description
   * Yêu cầu mật khẩu xác thực, nếu không hợp lệ trả lỗi 400/404.
   *
   * @param {string} id.path - ID người dùng
   * @param {DeleteUserDto} body.body - Dữ liệu body chứa mật khẩu
   */
  @Delete("/:id")
  public async deleteUserPermanent(@Path() id: string, @Body() body: DeleteUserDto): Promise<ApiResponse> {
    try {
      const result = await deleteUserPermanentValidate(id, body.password);
      return Success(result, "Xóa người dùng thành công");
    } catch (error: any) {
      console.error("Error deleting user:", error);
      if (error.statusCode === 400) return ProcessError(error.message, 400);
      if (error.statusCode === 404) return ProcessError(error.message, 404);
      return ProcessError("Đã xảy ra lỗi trong quá trình xóa người dùng.");
    }
  }

  /**
   * @summary Đổi mật khẩu cho người dùng theo ID
   * @description
   * Thay đổi mật khẩu mà không cần OTP, cung cấp mật khẩu mới hợp lệ.
   *
   * @param {string} id.path - ID người dùng
   * @param {ChangePasswordMobileDto} body.body - Body chứa mật khẩu mới
   */
  @Post("/change-password/:id")
  public async changePassword(@Path() id: string, @Body() body: ChangePasswordMobileDto): Promise<ApiResponse> {
    try {
      const result = await forgotPasswordNoOtp(id, body);
      return Success(result, "Đổi mật khẩu thành công");
    } catch (error: any) {
      console.error("Error changing password:", error);
      if (error.statusCode) return ProcessError(error.message, error.statusCode);
      return ProcessError("Lỗi hệ thống");
    }
  }
}
