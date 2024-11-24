import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from 'src/entities/transactions.entity';
import { UsersModule } from '../users/users.module';
import { Order } from 'src/entities/orders.entity';
import { WalletDeposit } from 'src/entities/wallet-deposit.entity';
import { Withdrawal } from 'src/entities/withdrawal.entity';
import { Deposit } from 'src/entities/deposit.entity';
import { SellerSubscription } from 'src/entities/seller-subscription.entity';
import { Exchange } from 'src/entities/exchange.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      Order,
      WalletDeposit,
      Withdrawal,
      Deposit,
      SellerSubscription,
      Exchange,
    ]),
    UsersModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
