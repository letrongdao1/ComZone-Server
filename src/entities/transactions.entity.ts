import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { User } from './users.entity';
import { Order } from './orders.entity';
import { WalletDeposit } from './wallet-deposit.entity';
import { Withdrawal } from './withdrawal.entity';
import { Deposit } from './deposit.entity';
import { SellerSubscription } from './seller-subscription.entity';
import { Exchange } from './exchange.entity';
import { RefundRequest } from './refund-request.entity';

@Entity('transactions')
export class Transaction extends BaseEntity {
  @ManyToOne(() => User, (user) => user.transactions, { eager: true })
  user: User;

  @ManyToOne(() => Order, (order) => order.transactions, {
    eager: true,
  })
  order: Order;

  @ManyToOne(() => Deposit, (deposit) => deposit.transactions, {
    eager: true,
  })
  deposit: Deposit;

  @ManyToOne(() => Exchange, (exchange) => exchange.transactions, {
    eager: true,
  })
  exchange: Exchange;

  @ManyToOne(
    () => RefundRequest,
    (refundRequest) => refundRequest.transactions,
    {
      eager: true,
    },
  )
  refundRequest: RefundRequest;

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
  type: 'ADD' | 'SUBTRACT';

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
