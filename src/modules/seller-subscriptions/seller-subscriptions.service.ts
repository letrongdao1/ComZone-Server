import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { SellerSubscription } from 'src/entities/seller-subscription.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { SellerSubsPlansService } from '../seller-subs-plans/seller-subs-plans.service';
import { Transaction } from 'src/entities/transactions.entity';
import { SellerSubscriptionDTO } from './dto/seller-subscription.dto';
import { generateNumericCode } from 'src/utils/generator/generators';
import { TransactionStatusEnum } from '../transactions/dto/transaction-status.enum';

@Injectable()
export class SellerSubscriptionsService extends BaseService<SellerSubscription> {
  constructor(
    @InjectRepository(SellerSubscription)
    private readonly sellerSubscriptionsRepository: Repository<SellerSubscription>,
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(SellerSubsPlansService)
    private readonly sellerSubsPlansService: SellerSubsPlansService,
  ) {
    super(sellerSubscriptionsRepository);
  }

  async getSellerSubsOfUser(userId: string) {
    return await this.sellerSubscriptionsRepository.findOne({
      where: {
        user: { id: userId },
      },
    });
  }

  async registerNewSellerSubscription(
    userId: string,
    sellerSubscriptionDto: SellerSubscriptionDTO,
  ) {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    const sellerSubsPlan = await this.sellerSubsPlansService.getOne(
      sellerSubscriptionDto.sellerSubscriptionPlanId,
    );
    if (!sellerSubsPlan)
      throw new NotFoundException('Subscription plan cannot be found!');

    if (user.balance < sellerSubsPlan.price)
      throw new ForbiddenException(
        'Insufficient balance to activate the subscription!',
      );

    await this.usersService.updateBalance(userId, sellerSubsPlan.price * -1);

    const newSubscription = this.sellerSubscriptionsRepository.create({
      user,
      plan: sellerSubsPlan,
      activatedTime: new Date(),
      remainingSellTime: sellerSubsPlan.sellTime,
      remainingAuctionTime: sellerSubsPlan.auctionTime,
    });

    const findUserSubs = await this.getSellerSubsOfUser(userId);

    if (findUserSubs)
      await this.sellerSubscriptionsRepository.update(
        findUserSubs.id,
        newSubscription,
      );
    else await this.sellerSubscriptionsRepository.save(newSubscription);

    const savedTransaction = this.transactionsRepository.create({
      user,
      code: generateNumericCode(8),
      sellerSubscription: newSubscription,
      amount: newSubscription.plan.price,
      status: TransactionStatusEnum.SUCCESSFUL,
      profitAmount: newSubscription.plan.price,
    });

    return await this.transactionsRepository
      .save(savedTransaction)
      .then(() => this.getOne(newSubscription.id));
  }
}
