//tạo mã otp
export function generateOTP(): string {
  const otp: number = Math.floor(100000 + Math.random() * 900000);
  console.log("Generated OTP:", otp);
  return otp.toString();
}
