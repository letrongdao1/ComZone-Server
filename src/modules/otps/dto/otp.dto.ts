import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateOtpDto {
  email: string;
  type: 'registration' | 'resetPassword'; // OTP type
}

export class VerifyOtpDto {
  email: string;
  otp: string;
  type: 'registration' | 'resetPassword'; // OTP type
}

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
