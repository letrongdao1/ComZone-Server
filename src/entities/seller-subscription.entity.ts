import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
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
  )
  plan: SellerSubscriptionPlan;

  @Column({
    name: 'activated_time',
    type: 'datetime',
  })
  activatedTime: Date;

  @Column({
    name: 'remaining_resource',
    type: 'int',
    nullable: true,
  })
  remainingResource: number;

  @Column({
    name: 'is_auto_renewed',
    type: 'boolean',
    default: true,
  })
  isAutoRenewed: boolean;

  @OneToOne(() => Transaction, (transaction) => transaction.sellerSubscription)
  transaction: Transaction;
}
