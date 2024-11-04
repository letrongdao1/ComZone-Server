import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
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
  placeDeposit(@Res() res: any, @Body() createDepositDto: CreateDepositDTO) {
    return this.depositsService.placeDeposit(res.user.id, createDepositDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  getDepositsOfUser(@Res() res: any) {
    return this.depositsService.getAllDepositOfUser(res.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('auction/:auction_id')
  getDepositsOfAnAuction(@Param('auction_id') auctionId: string) {
    return this.depositsService.getAllDepositOfAnAuction(auctionId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('exchange/:exchange_id')
  getDepositsOfAnExchange(@Param('exchange_id') exchangeId: string) {
    return this.depositsService.getAllDepositOfAnExchange(exchangeId);
  }
}
