import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DepositsService } from './deposits.service';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { CreateDepositDTO } from './dto/create-deposit.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Deposits')
@Controller('deposits')
export class DepositsController {
  constructor(private readonly depositsService: DepositsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  placeDeposit(@Req() req: any, @Body() createDepositDto: CreateDepositDTO) {
    return this.depositsService.placeDeposit(req.user.id, createDepositDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  getDepositsOfUser(@Req() req: any) {
    return this.depositsService.getAllDepositOfUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:id')
  getDepositsByUserId(@Param('id') id: string) {
    return this.depositsService.getAllDepositOfUser(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('auction/:auction_id')
  getDepositsOfAnAuction(@Param('auction_id') auctionId: string) {
    return this.depositsService.getAllDepositOfAnAuction(auctionId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('exchange-request/:exchange_id')
  getDepositsOfAnExchange(
    @Req() req: any,
    @Param('exchange_id') exchangeId: string,
  ) {
    return this.depositsService.getDepositsByExchangeRequest(
      req.user.id,
      exchangeId,
    );
  }
}
