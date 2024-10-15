import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ZalopayService } from './zalopay.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';

@ApiBearerAuth()
@ApiTags('Zalopay - (QR only)')
@Controller('zalopay')
export class ZalopayController {
  constructor(private readonly zalopayService: ZalopayService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createPaymentLink(@Body() data: any) {
    return this.zalopayService.createPaymentLink(data);
  }

  @Post('status/:id')
  getPaymentStatus(@Param('id') appTransId: string) {
    return this.zalopayService.getPaymentStatus(appTransId);
  }
}
