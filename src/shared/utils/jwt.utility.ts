import jwt from "jsonwebtoken";
import { GetUserDto } from "../../model/dto/user/user.dto"; // Đảm bảo bạn đã có interface này
// Đảm bảo bạn có SECRET_KEY trong env config

export function createToken(user: any, key: string = "chothongminh"): string {
  const baseDomain =
    key === "chothongminh"
      ? "https://sso.chothongminh.com"
      : "https://gober.vn";

  const payload = {
    id: user.id,
    emailAddress: user.emailAddress || "",
    role: user.role,
    privateKey: user.privateKey,
    sub: user.id,
    iss: baseDomain,
    aud: baseDomain,
    phoneNumber: user.phoneNumber || "",
  };
  const secretKey = process.env.SECRET_KEY || "chothongminh07082025@&dwc";

  return jwt.sign(payload, secretKey, { expiresIn: "7d" });
}
