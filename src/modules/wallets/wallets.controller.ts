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
import { WalletsService } from './wallets.service';
import { Roles } from '../authorization/roles.decorator';
import { Role } from '../authorization/role.enum';
import { PermissionsGuard } from '../authorization/permission.guard';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { WalletDTO } from './dto/wallet';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DepositRequestDTO } from './dto/deposit-request';

@ApiBearerAuth()
@ApiTags('Wallets')
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Roles(Role.MEMBER, Role.SELLER)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Post()
  createUserWallet(@Req() req: any, @Body() walletDto: WalletDTO) {
    return this.walletsService.createUserWallet(req.user.id, walletDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user')
  getUserWallet(@Req() req: any) {
    return this.walletsService.getUserWallet(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/deposit')
  deposit(@Req() req: any, @Body() depositRequest: DepositRequestDTO) {
    return this.walletsService.deposit(req.user.id, depositRequest);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/withdraw')
  withdraw(@Req() req: any, @Body() data: { amount: number }) {
    return this.walletsService.withdraw(req.user.id, data.amount);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/non-withdrawable-amount')
  updateNonWithdrawableAmount(
    @Req() req: any,
    @Body() data: { amount: number },
  ) {
    return this.walletsService.updateNonWithdrawableAmount(
      req.user.id,
      data.amount,
    );
  }
}
