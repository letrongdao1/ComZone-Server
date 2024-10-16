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
import { TransactionsService } from './transactions.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { TransactionDTO } from './dto/transactionDto';

@ApiBearerAuth()
@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createNewTransaction(
    @Req() req: any,
    @Body() transactionDto: TransactionDTO,
  ) {
    return this.transactionsService.createNewTransaction(
      req.user.id,
      transactionDto,
    );
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
