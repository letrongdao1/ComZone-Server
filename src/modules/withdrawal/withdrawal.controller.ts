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
import { WithdrawalService } from './withdrawal.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { WithdrawalDTO } from './dto/withdrawal.dto';

@ApiBearerAuth()
@ApiTags('Withdrawals')
@Controller('withdrawal')
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createNewWithdrawal(@Req() req: any, @Body() withdrawalDto: WithdrawalDTO) {
    return this.withdrawalService.createWithdrawal(req.user.id, withdrawalDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  getUserWithdrawals(@Req() req: any) {
    return this.withdrawalService.getUserWithdrawals(req.user.id);
  }

  @Patch('status/:withdrawal_id/:transaction_id')
  updateWithdrawalStatus(
    @Param('withdrawal_id') withdrawalId: string,
    @Param('transaction_id') transactionId: string,
  ) {
    return this.withdrawalService.updateWithdrawalStatus(
      withdrawalId,
      transactionId,
    );
  }
}
