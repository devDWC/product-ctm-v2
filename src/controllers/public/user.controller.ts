import {
  Route,
  Tags,
  Controller,
  Get,
  Query,
  Post,
  Put,
  Body,
  Path,
} from "tsoa";
import { ApiResponse } from "../../model/base/response.dto";
import { getUsers } from "../../service/mgo-services/users-service/admin/user.service";
import {
  Success,
  ExceptionError,
  ProcessError,
  NotfoundError,
} from "../../shared/utils/response.utility";
import {
  login,
  register,
  updateDynamicUser,
  getListAddressUserById,
  getUserByIdPublic,
  findUserWithEmailOrPhone,
  updateLatvsLngUser,
  updateEmailOrPhoneNumber,
  getTenantOrRandom,
  getUsersForComment,
  forgotPasswordforMultiChannel,
} from "../../service/mgo-services/users-service/public/user.service";
import { LoginDto } from "../../model/dto/auth/login.dto";
import {
  RegisterInputDto,
  RegisterOutputDto,
} from "../../model/dto/auth/register.dto";
import {
  UpdateUserDto,
  FindUserInput,
  UpdateLocationDto,
  InputupdateEmailOrPhoneDto,
  ForgotPasswordInputDto,
} from "../../model/dto/user/user.dto";
@Route("v1/public/users")
@Tags("Users")
export class UserController extends Controller {
  @Get("/")
  public async getUsers(
    @Query() search?: string,
    @Query() pageCurrent: number = 1,
    @Query() pageSize: number = 10,
    @Query() sortList?: string // dạng JSON string như: '[{"key":"emailAddress","value":"asc"}]'
  ): Promise<ApiResponse> {
    let parsedSortList: any[] = [];

    if (sortList) {
      try {
        parsedSortList = JSON.parse(sortList);
      } catch (error) {
        console.warn("Invalid sortList format. Must be JSON string.");
      }
    }

    const result = await getUsers(
      search || "",
      pageCurrent,
      pageSize,
      parsedSortList
    );

    return Success(result, "Lấy danh sách người dùng thành công");
  }

  @Post("/login")
  public async login(@Body() body: LoginDto): Promise<ApiResponse> {
    try {
      const result = await login(body.emailOrPhone, body.password);
      return Success(result, "Login successfully");
    } catch (error: any) {
      const message = error?.message || "Unexpected error during login";
      return ExceptionError(message);
    }
  }

  @Post("/register")
  public async register(@Body() body: RegisterInputDto): Promise<ApiResponse> {
    try {
      const result = await register(body);
      return Success(result, "Login successfully");
    } catch (error: any) {
      const message = error?.message || "Unexpected error during login";
      return ExceptionError(message);
    }
  }

  @Put("/updateDynamicUser/{id}")
  public async updateDynamicUser(
    @Path() id: string,
    @Body() body: UpdateUserDto
  ): Promise<ApiResponse> {
    try {
      const result = await updateDynamicUser(id, body);
      return Success(result, "Login successfully");
    } catch (error: any) {
      const message = error?.message || "Unexpected error during login";
      return ExceptionError(message);
    }
  }

  @Get("/getListAddressUserById/{id}")
  public async getListAddressUserById(
    @Path() id: string
  ): Promise<ApiResponse> {
    try {
      const result = await getListAddressUserById(id);
      if (!result) {
        return NotfoundError("Người dùng không tồn tại");
      }
      return Success(result, "Login successfully");
    } catch (error: any) {
      const message = error?.message || "Unexpected error during login";
      return ExceptionError(message);
    }
  }
  @Get("/{id}")
  public async getUserByIdPublic(@Path() id: string): Promise<ApiResponse> {
    try {
      const result = await getUserByIdPublic(id);
      if (!result) {
        return NotfoundError("Người dùng không tồn tại");
      }
      return Success(result, "Login successfully");
    } catch (error: any) {
      const message = error?.message || "Unexpected error during login";
      return ExceptionError(message);
    }
  }
  @Get("/findUserWithEmailOrPhone/getData/data")
  public async findUserWithEmailOrPhone(
    @Query() emailAddress?: string,
    @Query() phoneNumber?: string
  ): Promise<ApiResponse> {
    try {
      const result = await findUserWithEmailOrPhone({
        emailAddress,
        phoneNumber,
      });
      if (!result) {
        return NotfoundError("Người dùng không tồn tại");
      }
      return Success(result, "Login successfully");
    } catch (error: any) {
      const message = error?.message || "Unexpected error during login";
      return ExceptionError(message);
    }
  }

  @Put("/updateLatvsLngUser/{id}")
  public async updateLatvsLngUser(
    @Path() id: string,
    @Body() body: UpdateLocationDto
  ): Promise<ApiResponse> {
    try {
      const result = await updateLatvsLngUser(id, body.lng, body.lat);
      return result ? Success(result, "Login successfully") : ProcessError();
    } catch (error: any) {
      const message = error?.message || "Unexpected error during login";
      return ExceptionError(message);
    }
  }

  @Put("/updateEmailOrPhoneNumber/{id}")
  public async updateEmailOrPhoneNumber(
    @Path() id: string,
    @Body() body: InputupdateEmailOrPhoneDto
  ): Promise<ApiResponse> {
    try {
      const result = await updateEmailOrPhoneNumber(
        id,
        body.otp,
        body.phoneNumber,
        body.emailAddress
      );
      if (!result) {
        return NotfoundError("Không tim thấy người dùng để cập nhật");
      }
      return result ? Success(result, "Login successfully") : ProcessError();
    } catch (error: any) {
      const message = error?.message || "Unexpected error during login";
      return ExceptionError(message);
    }
  }

  @Get("/getTenantOrRandom/getTenant/data")
  public async getTenantOrRandom(@Query() id?: number): Promise<ApiResponse> {
    try {
      const result = await getTenantOrRandom(id);
      if (!result) {
        return NotfoundError("Người dùng không tồn tại");
      }
      return Success(result, "Login successfully");
    } catch (error: any) {
      const message = error?.message || "Unexpected error during login";
      return ExceptionError(message);
    }
  }

  @Get("/getUsersForComment/getUserComment")
  public async getUsersForComment(
    @Query() search?: string,
    @Query() pageCurrent?: number,
    @Query() pageSize?: number,
    @Query() sortList?: string
  ): Promise<ApiResponse> {
    try {
      const result = await getUsersForComment(
        search,
        pageCurrent,
        pageSize,
        sortList
      );
      if (!result) {
        return NotfoundError("Người dùng không tồn tại");
      }
      return Success(result, "Login successfully");
    } catch (error: any) {
      const message = error?.message || "Unexpected error during login";
      return ExceptionError(message);
    }
  }

  @Put("/forgotPassword/{phoneOrEmail}")
  public async forgotPasswordforMultiChannel(
    @Path() phoneOrEmail: string,
    @Body() body: ForgotPasswordInputDto
  ): Promise<ApiResponse> {
    try {
      if (body.action == "sendOtp") {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(phoneOrEmail);

        let emailAddress;
        let phoneNumber;

        if (isEmail) {
          emailAddress = phoneOrEmail;
        } else {
          phoneNumber = phoneOrEmail;
        }
        const result = await forgotPasswordforMultiChannel(
          {
            phoneOrEmail,
            channel: body.channel,
          },
          body.action
        );
        return Success(result, "Login successfully");
      } else {
        if (!body.otp || !body.newPassword || !body.action || !phoneOrEmail) {
          return ProcessError("thiếu thông tin cần thiét");
        }

        const result = await forgotPasswordforMultiChannel(
          {
            otp: body.otp,
            newPassword: body.newPassword,
            phoneOrEmail: phoneOrEmail,
            channel: body.channel,
          },
          body.action || null
        );

        return Success(result, "Login successfully");
      }
    } catch (error: any) {
      const message = error?.message || "Unexpected error during login";
      return ExceptionError(message);
    }
  }
}
