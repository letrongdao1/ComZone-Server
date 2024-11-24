import { Module } from '@nestjs/common';
import { WalletDepositService } from './wallet-deposit.service';
import { WalletDepositController } from './wallet-deposit.controller';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletDeposit } from 'src/entities/wallet-deposit.entity';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WalletDeposit]),
    UsersModule,
    TransactionsModule,
  ],
  controllers: [WalletDepositController],
  providers: [WalletDepositService],
  exports: [WalletDepositService],
})
export class WalletDepositModule {}
