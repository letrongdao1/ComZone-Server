import { Body, Controller, Get, Ip, Post, Req } from '@nestjs/common';
import { VnpayService } from './vnpay.service';
import { VNPayRequest } from './dto/vnp-payment-url-request';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('VNPay')
@ApiBearerAuth()
@Controller('vnpay')
export class VnpayController {
  constructor(private readonly vnpayService: VnpayService) {}

  @Post('create_payment_link')
  createPaymentLink(@Body() vnpayRequest: VNPayRequest, @Ip() ip: string) {
    return this.vnpayService.createPaymentLink(vnpayRequest, ip);
  }

  @Get('return')
  handleReturn(@Req() req: any) {
    return this.vnpayService.handlePaymentReturn(req);
  }
}
