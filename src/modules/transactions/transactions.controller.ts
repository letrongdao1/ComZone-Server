import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Roles } from '../authorization/roles.decorator';
import { Role } from '../authorization/role.enum';
import { PermissionsGuard } from '../authorization/permission.guard';

@ApiBearerAuth()
@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Roles(Role.MODERATOR, Role.ADMIN)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Get('all')
  getAllTransactions() {
    return this.transactionsService.getAllWithDeleted();
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  getAllTransactionsOfUser(@Req() req: any) {
    return this.transactionsService.getAllTransactionsOfUser(req.user.id);
  }

  @Get('/code/:code')
  getTransactionByCode(@Param('code') code: string) {
    return this.transactionsService.getTransactionByCode(code);
  }

  @Get(':transactionId')
  getTransactionById(@Param('transactionId') transactionId: string) {
    return this.transactionsService.getOne(transactionId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('status/:transactionId')
  updateTransactionStatus(
    @Param('transactionId') transactionId: string,
    @Body() newStatus: { status: 'PENDING' | 'SUCCESSFUL' | 'FAILED' },
  ) {
    return this.transactionsService.updateTransactionStatus(
      transactionId,
      newStatus.status,
    );
  }
}
