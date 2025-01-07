import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DepositsService } from './deposits.service';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { ExchangeDepositDTO } from './dto/create-deposit.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Deposits')
@Controller('deposits')
export class DepositsController {
  constructor(private readonly depositsService: DepositsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('auction/:id')
  placeDeposit(@Req() req: any, @Param('id') id: string) {
    return this.depositsService.placeDeposit(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('exchange')
  placeExchangeDeposit(@Req() req: any, @Body() dto: ExchangeDepositDTO) {
    return this.depositsService.placeExchangeDeposit(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  getDepositsOfUser(@Req() req: any) {
    return this.depositsService.getAllDepositOfUser(req.user.id);
  }
  @UseGuards(JwtAuthGuard)
  @Get('user/auction')
  async getUserDepositsWithAuction(@Req() req: any) {
    return await this.depositsService.getUserDepositsWithAuction(req.user.id);
  }
  @UseGuards(JwtAuthGuard)
  @Get('user/:id')
  getDepositsByUserId(@Param('id') id: string) {
    return this.depositsService.getAllDepositOfUser(id);
  }
  @UseGuards(JwtAuthGuard)
  @Get('auction/user/:id')
  checkUserDepositsOfAnAuction(@Req() req: any, @Param('id') id: string) {
    return this.depositsService.getUserDepositOfAnAuction(req.user.id, id);
  }

  // @Patch('auction/:auctionId/refund')
  // async refundAllDepositsOfAnAuction(@Param('auctionId') auctionId: string) {
  //   return await this.depositsService.refundAllDepositsExceptWinner(auctionId);
  // }
  // @Patch('/auction/:auctionId/refund-winner')
  // async refundWinner(@Param('auctionId') auctionId: string) {
  //   return await this.depositsService.refundDepositToWinner(auctionId,);
  // }

  // @UseGuards(JwtAuthGuard)
  @Get('auction/:id')
  getDepositsOfAnAuction(@Param('id') id: string) {
    return this.depositsService.getAllDepositOfAnAuction(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('exchange/:exchange_id')
  getDepositsOfAnExchange(
    @Req() req: any,
    @Param('exchange_id') exchangeId: string,
  ) {
    return this.depositsService.getDepositsByExchange(req.user.id, exchangeId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('exchange/expired/:exchange_id')
  refundExpiredExchange(
    @Req() req: any,
    @Param('exchange_id') exchangeId: string,
  ) {
    return this.depositsService.refundExpiredExchange(req.user.id, exchangeId);
  }
}
