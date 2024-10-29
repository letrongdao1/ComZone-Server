import { Module } from '@nestjs/common';
import { SellerSubsPlansService } from './seller-subs-plans.service';
import { SellerSubsPlansController } from './seller-subs-plans.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerSubscriptionPlan } from 'src/entities/seller-subs-plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SellerSubscriptionPlan])],
  controllers: [SellerSubsPlansController],
  providers: [SellerSubsPlansService],
  exports: [SellerSubsPlansService],
})
export class SellerSubsPlansModule {}
