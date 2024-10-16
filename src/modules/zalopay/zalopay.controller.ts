import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ZalopayService } from './zalopay.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { ZaloPayRequest } from './dto/zalopay-payment-url-request';

@ApiBearerAuth()
@ApiTags('Zalopay - (ZaloPay QR only)')
@Controller('zalopay')
export class ZalopayController {
  constructor(private readonly zalopayService: ZalopayService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createPaymentLink(@Req() req: any, @Body() zaloPayRequest: ZaloPayRequest) {
    return this.zalopayService.createPaymentLink(req.user.id, zaloPayRequest);
  }

  @Get('status/:transactionId')
  getPaymentStatus(
    @Req() req: any,
    @Param('transactionId') transactionId: string,
  ) {
    return this.zalopayService.getPaymentStatus(req, transactionId);
  }
}
