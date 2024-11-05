import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from 'src/entities/transactions.entity';
import { UsersModule } from '../users/users.module';
import { OrdersModule } from '../orders/orders.module';
import { WalletDepositModule } from '../wallet-deposit/wallet-deposit.module';
import { WithdrawalModule } from '../withdrawal/withdrawal.module';
import { DepositsModule } from '../deposits/deposits.module';
import { SellerSubscriptionsModule } from '../seller-subscriptions/seller-subscriptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    UsersModule,
    OrdersModule,
    WalletDepositModule,
    WithdrawalModule,
    DepositsModule,
    SellerSubscriptionsModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
