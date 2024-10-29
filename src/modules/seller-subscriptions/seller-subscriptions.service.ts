import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { SellerSubscription } from 'src/entities/seller-subscription.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class SellerSubscriptionsService extends BaseService<SellerSubscription> {
  constructor(
    @InjectRepository(SellerSubscription)
    private readonly sellerSubscriptionsRepository: Repository<SellerSubscription>,
    @Inject() private readonly usersService: UsersService,
  ) {
    super(sellerSubscriptionsRepository);
  }

  async createNewSellerSubscription() {}
}
