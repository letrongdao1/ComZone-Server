import { BaseEntity } from 'src/common/entity.base';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from './users.entity';
import { Transaction } from './transactions.entity';
import { SellerSubscriptionPlan } from './seller-subs-plan.entity';

@Entity('seller-subscription')
export class SellerSubscription extends BaseEntity {
  @OneToOne(() => User, { eager: true })
  @JoinColumn()
  user: User;

  @ManyToOne(
    () => SellerSubscriptionPlan,
    (sellSubPlan) => sellSubPlan.sellerSubscriptions,
    { eager: true },
  )
  plan: SellerSubscriptionPlan;

  @Column({
    name: 'activated_time',
    type: 'datetime',
    nullable: true,
  })
  activatedTime: Date;

  @Column({
    name: 'remaining_sell_time',
    type: 'int',
    nullable: true,
  })
  remainingSellTime: number;

  @Column({
    name: 'remaining_auction_time',
    type: 'int',
    nullable: true,
  })
  remainingAuctionTime: number;

  @Column({
    name: 'is_auto_renewed',
    type: 'boolean',
    default: false,
  })
  isAutoRenewed: boolean;

  @Column({
    name: 'used_trial',
    type: 'boolean',
    nullable: true,
    default: false,
  })
  usedTrial: boolean;

  @OneToMany(() => Transaction, (transaction) => transaction.sellerSubscription)
  transactions: Transaction[];
}
