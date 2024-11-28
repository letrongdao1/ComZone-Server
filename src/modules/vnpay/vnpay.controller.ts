import {
  Body,
  Controller,
  Get,
  Ip,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { VnpayService } from './vnpay.service';
import { VNPayRequestDTO } from './dto/vnp-payment-url-request';
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
    @Body() vnpayRequest: VNPayRequestDTO,
    @Ip() ip: string,
  ) {
    return this.vnpayService.createPaymentLink(req.user.id, vnpayRequest, ip);
  }

  @Get('return/:transactionId')
  handleReturn(
    @Req() req: any,
    @Res() res: any,
    @Param('transactionId') transactionId: string,
    @Query('redirect') path: string,
  ) {
    return this.vnpayService.handlePaymentReturn(req, res, transactionId, path);
  }
}
