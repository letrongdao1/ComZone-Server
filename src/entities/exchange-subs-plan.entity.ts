import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, OneToMany } from 'typeorm';
import { ExchangeSubscription } from './exchange-subscription.entity';

@Entity('exchange-subscription-plan')
export class ExchangeSubscriptionPlan extends BaseEntity {
  @Column({
    type: 'float',
    nullable: false,
  })
  price: number;

  @Column({
    type: 'int',
    nullable: true,
    default: 0,
  })
  duration: number;

  @Column({
    name: 'offered_resource',
    type: 'int',
    nullable: true,
    default: 0,
  })
  offeredResource: number;

  @OneToMany(() => ExchangeSubscription, (exchangeSub) => exchangeSub.plan)
  exchangeSubscriptions: ExchangeSubscription[];
}
