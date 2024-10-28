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
import { WalletDepositService } from './wallet-deposit.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { WalletDepositDTO } from './dto/wallet-deposit.dto';

@ApiBearerAuth()
@ApiTags('Wallet deposits')
@Controller('wallet-deposits')
export class WalletDepositController {
  constructor(private readonly walletDepositService: WalletDepositService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createWalletDeposit(
    @Req() req: any,
    @Body() walletDepositDto: WalletDepositDTO,
  ) {
    return this.walletDepositService.createWalletDeposit(
      req.user.id,
      walletDepositDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  getWalletDepositsByUser(@Req() req: any) {
    return this.walletDepositService.getWalletDepositsByUser(req.user.id);
  }

  @Patch('status/:wallet_deposit_id/:transaction_id')
  updateWalletDepositStatus(
    @Param('wallet_deposit_id') walletDepositId: string,
    @Param('transaction_id') transactionId: string,
  ) {
    return this.walletDepositService.updateWalletDepositStatus(
      walletDepositId,
      transactionId,
    );
  }
}
