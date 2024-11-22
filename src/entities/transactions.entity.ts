import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { User } from './users.entity';
import { Order } from './orders.entity';
import { WalletDeposit } from './wallet-deposit.entity';
import { Withdrawal } from './withdrawal.entity';
import { Deposit } from './deposit.entity';
import { SellerSubscription } from './seller-subscription.entity';
import { ExchangeSubscription } from './exchange-subscription.entity';
import { Exchange } from './exchange.entity';

@Entity('transactions')
export class Transaction extends BaseEntity {
  @ManyToOne(() => User, (user) => user.transactions, { eager: true })
  user: User;

  @OneToOne(() => Order, (order) => order.transaction, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'order' })
  order?: Order;

  @OneToOne(() => WalletDeposit, (walletDeposit) => walletDeposit.transaction, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'wallet-deposit' })
  walletDeposit?: WalletDeposit;

  @OneToOne(() => Withdrawal, (withdrawal) => withdrawal.transaction, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'withdrawal' })
  withdrawal?: Withdrawal;

  @ManyToOne(() => Deposit, (deposit) => deposit.transactions, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'deposit' })
  deposit?: Deposit;

  @OneToOne(
    () => SellerSubscription,
    (sellerSubscription) => sellerSubscription.transaction,
    {
      nullable: true,
      eager: true,
    },
  )
  @JoinColumn({ name: 'seller-subscription' })
  sellerSubscription?: SellerSubscription;

  @OneToOne(
    () => ExchangeSubscription,
    (exchangeSubscription) => exchangeSubscription.transaction,
    { nullable: true, eager: true },
  )
  @JoinColumn({ name: 'exchange-subscription' })
  exchangeSubscription?: ExchangeSubscription;

  @ManyToOne(() => Exchange, (exchange) => exchange.transactions, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'exchange' })
  exchange?: Exchange;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  code: string;

  @Column({
    type: 'float',
    nullable: false,
  })
  amount: number;

  @Column({
    type: 'enum',
    enum: ['ADD', 'SUBTRACT'],
    nullable: false,
    default: 'SUBTRACT',
  })
  type: string;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'SUCCESSFUL', 'FAILED'],
    nullable: false,
    default: 'PENDING',
  })
  status: string;

  @Column({
    name: 'profit_amount',
    type: 'float',
    nullable: true,
  })
  profitAmount?: number;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  note?: string;
}
