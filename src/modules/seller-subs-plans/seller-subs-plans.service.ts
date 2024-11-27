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

  async getAllPlans() {
    return await this.sellerSubsPlansRepository.find({
      order: { price: 'ASC' },
    });
  }

  async createNewSellerSubsPlan(dto: SubscriptionPlanDTO) {
    const plan = this.sellerSubsPlansRepository.create({
      price: dto.price,
      duration: dto.duration,
      sellTime: dto.sellTime,
      auctionTime: dto.auctionTime,
    });
    return await this.sellerSubsPlansRepository.save(plan);
  }
}
