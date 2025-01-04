import { Controller, Post, Body } from '@nestjs/common';
import { OtpService } from './otps.service';
import { CreateOtpDto, ResetPasswordDto, VerifyOtpDto } from './dto/otp.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('OTP')
@Controller('otp')
export class OtpController {
  constructor(private otpService: OtpService) {}

  @Post('register')
  async generateOtpForRegistration(@Body() createOtpDto: CreateOtpDto) {
    return this.otpService.generateOtp({
      ...createOtpDto,
      type: 'registration',
    });
  }

  @Post('reset_password')
  async generateOtpForResetPassword(@Body() createOtpDto: CreateOtpDto) {
    return this.otpService.generateOtp({
      ...createOtpDto,
      type: 'resetPassword',
    });
  }

  @Post('verify')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.otpService.verifyOtp(verifyOtpDto);
  }
  @Post('reset')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.otpService.resetPassword(resetPasswordDto);
    return { message: 'Password has been reset successfully' };
  }
}
