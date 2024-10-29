import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, OneToMany } from 'typeorm';
import { SellerSubscription } from './seller-subscription.entity';

@Entity('seller-subscription-plan')
export class SellerSubscriptionPlan extends BaseEntity {
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

  @OneToMany(() => SellerSubscription, (sellerSub) => sellerSub.plan)
  sellerSubscriptions: SellerSubscription[];
}
