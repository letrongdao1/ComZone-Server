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
import { SellerSubscriptionDTO } from './dto/seller-subscription.dto';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class SellerSubscriptionsService extends BaseService<SellerSubscription> {
  constructor(
    @InjectRepository(SellerSubscription)
    private readonly sellerSubscriptionsRepository: Repository<SellerSubscription>,

    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(TransactionsService)
    private readonly transactionsService: TransactionsService,
    @Inject(SellerSubsPlansService)
    private readonly sellerSubsPlansService: SellerSubsPlansService,
  ) {
    super(sellerSubscriptionsRepository);
  }

  async getSellerSubsOfUser(userId: string) {
    const sellerSub = await this.sellerSubscriptionsRepository.findOne({
      where: {
        user: { id: userId },
      },
    });

    if (!sellerSub) return null;

    const checkActive = () => {
      if (
        sellerSub.remainingSellTime === 0 &&
        sellerSub.remainingAuctionTime === 0
      ) {
        return sellerSub.plan.duration > 0;
      } else
        return sellerSub.plan.duration > 0
          ? sellerSub.activatedTime.getTime() +
              sellerSub.plan.duration * 30 * 24 * 60 * 60 * 1000 >
              new Date().getTime()
          : true;
    };

    return {
      ...sellerSub,
      canSell: sellerSub.remainingSellTime > 0,
      canAuction: sellerSub.remainingAuctionTime > 0,
      isActive: checkActive(),
    };
  }

  async registerNewSellerSubscription(
    userId: string,
    sellerSubscriptionDto: SellerSubscriptionDTO,
  ) {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    const sellerSubsPlan = await this.sellerSubsPlansService.getOne(
      sellerSubscriptionDto.planId,
    );
    if (!sellerSubsPlan)
      throw new NotFoundException('Subscription plan cannot be found!');

    if (user.balance < sellerSubsPlan.price)
      throw new ForbiddenException(
        'Insufficient balance to register the subscription!',
      );

    await this.usersService.updateBalance(userId, -sellerSubsPlan.price);

    const newSubscription = this.sellerSubscriptionsRepository.create({
      user,
      plan: sellerSubsPlan,
      activatedTime: new Date(),
      remainingSellTime: sellerSubsPlan.sellTime,
      remainingAuctionTime: sellerSubsPlan.auctionTime,
    });

    const findUserSubs = await this.getSellerSubsOfUser(userId);

    if (findUserSubs)
      await this.sellerSubscriptionsRepository.update(findUserSubs.id, {
        plan: sellerSubsPlan,
        activatedTime: new Date(),
        remainingAuctionTime:
          findUserSubs.remainingAuctionTime + sellerSubsPlan.auctionTime,
        remainingSellTime:
          findUserSubs.remainingSellTime + sellerSubsPlan.sellTime,
        isAutoRenewed: true,
      });
    else await this.sellerSubscriptionsRepository.save(newSubscription);

    if (sellerSubsPlan.price > 0)
      await this.transactionsService.createSellerSubscriptionTransaction(
        userId,
        newSubscription.id,
      );

    return this.getOne(newSubscription.id);
  }

  async updateAfterSell(userId: string, quantity: number) {
    const sellerSub = await this.sellerSubscriptionsRepository.findOne({
      where: {
        user: { id: userId },
      },
    });

    if (!sellerSub)
      throw new NotFoundException('Seller subscription cannot be found!');
    if (sellerSub.remainingSellTime < quantity)
      throw new ForbiddenException('Insufficient sell time!');

    return await this.sellerSubscriptionsRepository.update(sellerSub.id, {
      remainingSellTime: sellerSub.remainingSellTime - quantity,
    });
  }

  async updateAfterAuction(userId: string, quantity: number) {
    const sellerSub = await this.sellerSubscriptionsRepository.findOne({
      where: {
        user: { id: userId },
      },
    });

    if (!sellerSub)
      throw new NotFoundException('Seller subscription cannot be found!');
    if (sellerSub.remainingAuctionTime < quantity)
      throw new ForbiddenException('Insufficient auction time!');

    return await this.sellerSubscriptionsRepository.update(sellerSub.id, {
      remainingAuctionTime: sellerSub.remainingAuctionTime - quantity,
    });
  }
}
