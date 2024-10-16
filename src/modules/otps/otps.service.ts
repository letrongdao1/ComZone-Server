// otp.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Otp } from '../../entities/otp.entity';
import { User } from '../../entities/users.entity';
import { CreateOtpDto, ResetPasswordDto, VerifyOtpDto } from './dto/otp.dto';
import * as nodemailer from 'nodemailer';
import { generateOTP } from 'src/utils/otpGenerator';
import * as bcrypt from 'bcrypt';
@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async generateOtp(createOtpDto: CreateOtpDto): Promise<void> {
    const { email, type } = createOtpDto;

    // Find the user by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user && type === 'resetPassword') {
      throw new NotFoundException('User not found');
    }

    // Generate a 6-digit OTP
    const otpCode = generateOTP();

    // Set OTP expiration to 1 minute
    const expiredAt = new Date(Date.now() + 60000);

    // Check if an OTP entry already exists for this email
    const existingOtp = await this.otpRepository.findOne({ where: { email } });

    if (existingOtp) {
      // Update the existing OTP record
      existingOtp.otp = otpCode;
      existingOtp.expiredAt = expiredAt;
      await this.otpRepository.save(existingOtp);
    } else {
      // Create a new OTP record if it doesn't exist
      const otp = this.otpRepository.create({
        user,
        email,
        otp: otpCode,
        expiredAt,
      });
      await this.otpRepository.save(otp);
    }

    // Send OTP via email
    await this.sendOtpEmail(email, otpCode);
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<boolean> {
    const { email, otp } = verifyOtpDto;

    // Find the OTP record by email and check if it's still valid
    const otpRecord = await this.otpRepository.findOne({
      where: { email, otp, expiredAt: MoreThan(new Date()) }, // Check expiration in the query
    });

    if (!otpRecord) {
      throw new NotFoundException('Invalid or expired OTP');
    }
    return true;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { email, otp, newPassword } = resetPasswordDto;

    // Verify OTP before proceeding
    const isOtpValid = await this.verifyOtp({
      email,
      otp,
      type: 'resetPassword',
    });
    if (!isOtpValid) {
      throw new NotFoundException('Invalid or expired OTP');
    }

    // Find user and update password
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash the new password
    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
  }

  private async sendOtpEmail(email: string, otp: string): Promise<void> {
    // Set up nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USERNAME, // Your Gmail address
        pass: process.env.MAIL_PASSWORD, // Your Gmail password
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.MAIL_USERNAME,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
  }
}
