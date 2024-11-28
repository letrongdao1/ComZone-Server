import { Module } from '@nestjs/common';
import { SellerSubscriptionsService } from './seller-subscriptions.service';
import { SellerSubscriptionsController } from './seller-subscriptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerSubscription } from 'src/entities/seller-subscription.entity';
import { UsersModule } from '../users/users.module';
import { SellerSubsPlansModule } from '../seller-subs-plans/seller-subs-plans.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SellerSubscription]),
    UsersModule,
    SellerSubsPlansModule,
    TransactionsModule,
  ],
  controllers: [SellerSubscriptionsController],
  providers: [SellerSubscriptionsService],
  exports: [SellerSubscriptionsService],
})
export class SellerSubscriptionsModule {}
