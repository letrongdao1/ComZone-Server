import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './users.entity';
import { Transaction } from './transactions.entity';

@Entity('seller-subscription')
export class SellerSubscription extends BaseEntity {
  @OneToOne(() => User, { eager: true })
  @JoinColumn()
  user: User;

  @Column({
    type: 'enum',
    enum: [1, 2, 3],
    nullable: false,
    default: 1,
  })
  level: number;

  @Column({
    type: 'float',
    precision: 2,
    nullable: false,
  })
  price: number;

  @Column({
    name: 'activated_time',
    type: 'datetime',
  })
  activatedTime: Date;

  @Column({
    name: 'valid_until',
    type: 'datetime',
    nullable: false,
  })
  validUntil: Date;

  @Column({
    name: 'is_auto_renewed',
    type: 'boolean',
    default: true,
  })
  isAutoRenewed: boolean;

  @OneToOne(() => Transaction, (transaction) => transaction.sellerSubscription)
  transaction: Transaction;
}
