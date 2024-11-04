import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { User } from './users.entity';
import { Order } from './orders.entity';
import { WalletDeposit } from './wallet-deposit.entity';
import { Withdrawal } from './withdrawal.entity';
import { Deposit } from './deposit.entity';
import { SellerSubscription } from './seller-subscription.entity';
import { ExchangeSubscription } from './exchange-subscription.entity';
import { ExchangeCompensation } from './exchange-compensation.entity';

@Entity('transactions')
export class Transaction extends BaseEntity {
  @ManyToOne(() => User, (user) => user.transactions, { eager: true })
  user: User;

  @OneToOne(() => Order, (order) => order.transaction, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'order' })
  order: Order;

  @OneToOne(() => WalletDeposit, (walletDeposit) => walletDeposit.transaction, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'wallet-deposit' })
  walletDeposit: WalletDeposit;

  @OneToOne(() => Withdrawal, (withdrawal) => withdrawal.transaction, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'withdrawal' })
  withdrawal: Withdrawal;

  @OneToOne(() => Deposit, (deposit) => deposit.transaction, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'deposit' })
  deposit: Deposit;

  @OneToOne(
    () => SellerSubscription,
    (sellerSubscription) => sellerSubscription.transaction,
    {
      nullable: true,
      eager: true,
    },
  )
  @JoinColumn({ name: 'seller-subscription' })
  sellerSubscription: SellerSubscription;

  @OneToOne(
    () => ExchangeSubscription,
    (exchangeSubscription) => exchangeSubscription.transaction,
    { nullable: true, eager: true },
  )
  @JoinColumn({ name: 'exchange-subscription' })
  exchangeSubscription: ExchangeSubscription;

  @OneToOne(
    () => ExchangeCompensation,
    (exchangeCompensation) => exchangeCompensation.transactions,
    { nullable: true, eager: true },
  )
  @JoinColumn({ name: 'exchange-compensation' })
  exchangeCompensation: ExchangeCompensation;

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
    enum: ['PENDING', 'SUCCESSFUL', 'FAILED'],
    nullable: false,
    default: 'PENDING',
  })
  status: string;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isUsed: boolean;

  @Column({
    name: 'payment_gateway',
    type: 'varchar',
    nullable: true,
  })
  paymentGateway: string;

  @Column({
    name: 'profit_amount',
    type: 'float',
    nullable: true,
  })
  profitAmount: number;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  note: string;
}
