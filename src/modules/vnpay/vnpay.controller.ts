import {
  Body,
  Controller,
  Get,
  Ip,
  Param,
  Post,
  Req,
  Res,
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
  @Post()
  createPaymentLink(
    @Req() req: any,
    @Body() vnpayRequest: VNPayRequest,
    @Ip() ip: string,
  ) {
    return this.vnpayService.createPaymentLink(
      req.user.id,
      vnpayRequest,
      ip,
      'WALLET',
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  createPaymentLinkInCheckout(
    @Req() req: any,
    @Body() vnpayRequest: VNPayRequest,
    @Ip() ip: string,
  ) {
    return this.vnpayService.createPaymentLink(
      req.user.id,
      vnpayRequest,
      ip,
      'CHECKOUT',
    );
  }

  @Get('return/:transactionId')
  handleReturn(
    @Req() req: any,
    @Res() res: any,
    @Param('transactionId') transactionId: string,
  ) {
    return this.vnpayService.handlePaymentReturn(
      req,
      res,
      transactionId,
      'WALLET',
    );
  }

  @Get('checkout/return/:transactionId')
  handleReturnInCheckout(
    @Req() req: any,
    @Res() res: any,
    @Param('transactionId') transactionId: string,
  ) {
    return this.vnpayService.handlePaymentReturn(
      req,
      res,
      transactionId,
      'CHECKOUT',
    );
  }
}
