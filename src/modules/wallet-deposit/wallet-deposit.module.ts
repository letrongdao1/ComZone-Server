import { Module } from '@nestjs/common';
import { WalletDepositService } from './wallet-deposit.service';
import { WalletDepositController } from './wallet-deposit.controller';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletDeposit } from 'src/entities/wallet-deposit.entity';
import { TransactionsModule } from '../transactions/transactions.module';
import { Transaction } from 'src/entities/transactions.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([WalletDeposit, Transaction]),
    UsersModule,
  ],
  controllers: [WalletDepositController],
  providers: [WalletDepositService],
  exports: [WalletDepositService],
})
export class WalletDepositModule {}
