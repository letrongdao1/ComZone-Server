import { Module } from '@nestjs/common';
import { WithdrawalService } from './withdrawal.service';
import { WithdrawalController } from './withdrawal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Withdrawal } from 'src/entities/withdrawal.entity';
import { SourcesOfFundModule } from '../sources-of-fund/sources-of-fund.module';
import { EventsModule } from '../socket/event.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Withdrawal]),
    UsersModule,
    SourcesOfFundModule,
    TransactionsModule,
    EventsModule,
  ],
  controllers: [WithdrawalController],
  providers: [WithdrawalService],
  exports: [WithdrawalService],
})
export class WithdrawalModule {}
