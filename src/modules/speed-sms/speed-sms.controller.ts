import { Body, Controller, Post } from '@nestjs/common';
import { SpeedSmsService } from './speed-sms.service';
import { SendSMSDTO } from './dto/sms.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Speed SMS service')
@Controller('speed-sms')
export class SpeedSmsController {
  constructor(private readonly speedSmsService: SpeedSmsService) {}

  @Post('send')
  sendNewSMS(@Body() dto: SendSMSDTO) {
    return this.speedSmsService.sendSMS([dto.phone], dto.content);
  }
}
