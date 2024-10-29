import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { User } from './users.entity';
import { Transaction } from './transactions.entity';
import { ExchangeSubscriptionPlan } from './exchange-subs-plan.entity';

@Entity('exchange-subscription')
export class ExchangeSubscription extends BaseEntity {
  @OneToOne(() => User, { eager: true })
  @JoinColumn()
  user: User;

  @ManyToOne(
    () => ExchangeSubscriptionPlan,
    (exchangeSubPlan) => exchangeSubPlan.exchangeSubscriptions,
  )
  plan: ExchangeSubscriptionPlan;

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

  @OneToOne(
    () => Transaction,
    (transaction) => transaction.exchangeSubscription,
  )
  transaction: Transaction;
}
