import { Module } from '@nestjs/common';
import { SpeedSmsService } from './speed-sms.service';
import { SpeedSmsController } from './speed-sms.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [SpeedSmsController],
  providers: [SpeedSmsService],
})
export class SpeedSmsModule {}
