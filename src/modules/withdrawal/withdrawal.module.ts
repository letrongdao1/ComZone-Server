import { Module } from '@nestjs/common';
import { WithdrawalService } from './withdrawal.service';
import { WithdrawalController } from './withdrawal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Withdrawal } from 'src/entities/withdrawal.entity';
import { Transaction } from 'src/entities/transactions.entity';
import { SourcesOfFundModule } from '../sources-of-fund/sources-of-fund.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Withdrawal, Transaction]),
    SourcesOfFundModule,
  ],
  controllers: [WithdrawalController],
  providers: [WithdrawalService],
  exports: [WithdrawalService],
})
export class WithdrawalModule {}
