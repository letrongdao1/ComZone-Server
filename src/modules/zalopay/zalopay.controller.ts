import { Body, Controller, Param, Post } from '@nestjs/common';
import { ZalopayService } from './zalopay.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Zalopay - (QR only)')
@Controller('zalopay')
export class ZalopayController {
  constructor(private readonly zalopayService: ZalopayService) {}

  @Post()
  createPaymentLink(@Body() data: any) {
    return this.zalopayService.createPaymentLink(data);
  }

  @Post('status/:id')
  getPaymentStatus(@Param('id') appTransId: string) {
    return this.zalopayService.getPaymentStatus(appTransId);
  }
}
