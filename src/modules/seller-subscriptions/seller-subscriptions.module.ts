import { Module } from '@nestjs/common';
import { SellerSubscriptionsService } from './seller-subscriptions.service';
import { SellerSubscriptionsController } from './seller-subscriptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerSubscription } from 'src/entities/seller-subscription.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([SellerSubscription]), UsersModule],
  controllers: [SellerSubscriptionsController],
  providers: [SellerSubscriptionsService],
  exports: [SellerSubscriptionsService],
})
export class SellerSubscriptionsModule {}
