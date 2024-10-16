import {
  Body,
  Controller,
  Get,
  Ip,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { VnpayService } from './vnpay.service';
import { VNPayRequest } from './dto/vnp-payment-url-request';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';

@ApiBearerAuth()
@ApiTags('VNPay')
@Controller('vnpay')
export class VnpayController {
  constructor(private readonly vnpayService: VnpayService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create_payment_link')
  createPaymentLink(
    @Req() req: any,
    @Body() vnpayRequest: VNPayRequest,
    @Ip() ip: string,
  ) {
    return this.vnpayService.createPaymentLink(req.user.id, vnpayRequest, ip);
  }

  @Get('return/:transactionId')
  handleReturn(@Req() req: any, @Param('transactionId') transactionId: string) {
    return this.vnpayService.handlePaymentReturn(req, transactionId);
  }
}
