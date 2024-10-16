// otp.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpService } from './otps.service';
import { OtpController } from './otps.controller';
import { Otp } from '../../entities/otp.entity';
import { User } from '../../entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Otp, User])],
  providers: [OtpService],
  controllers: [OtpController],
})
export class OtpModule {}
