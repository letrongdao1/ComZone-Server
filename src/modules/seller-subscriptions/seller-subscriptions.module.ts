import { Module } from '@nestjs/common';
import { SellerSubscriptionsService } from './seller-subscriptions.service';
import { SellerSubscriptionsController } from './seller-subscriptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerSubscription } from 'src/entities/seller-subscription.entity';
import { UsersModule } from '../users/users.module';
import { SellerSubsPlansModule } from '../seller-subs-plans/seller-subs-plans.module';
import { Transaction } from 'src/entities/transactions.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SellerSubscription, Transaction]),
    UsersModule,
    SellerSubsPlansModule,
  ],
  controllers: [SellerSubscriptionsController],
  providers: [SellerSubscriptionsService],
  exports: [SellerSubscriptionsService],
})
export class SellerSubscriptionsModule {}
