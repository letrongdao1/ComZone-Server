import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { SellerSubscriptionPlan } from 'src/entities/seller-subs-plan.entity';
import { Repository } from 'typeorm';
import { SubscriptionPlanDTO } from './dto/subscription-plan.dto';

@Injectable()
export class SellerSubsPlansService extends BaseService<SellerSubscriptionPlan> {
  constructor(
    @InjectRepository(SellerSubscriptionPlan)
    private readonly sellerSubsPlansRepository: Repository<SellerSubscriptionPlan>,
  ) {
    super(sellerSubsPlansRepository);
  }

  async createNewSellerSubsPlan(subscriptionPlanDto: SubscriptionPlanDTO) {
    return await this.sellerSubsPlansRepository.save(subscriptionPlanDto);
  }
}
