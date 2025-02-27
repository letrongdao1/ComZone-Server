import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ZalopayService } from './zalopay.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { ZaloPayRequest } from './dto/zalopay-payment-url-request';

@ApiBearerAuth()
@ApiTags('Zalopay')
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
    @Res() res: any,
    @Param('transactionId') transactionId: string,
    @Query('redirect') path: string,
  ) {
    return this.zalopayService.getPaymentStatus(req, res, transactionId, path);
  }
}
