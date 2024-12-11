import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from './users.entity';
import { Order } from './orders.entity';
import { Auction } from './auction.entity';
import { Exchange } from './exchange.entity';
import { Transaction } from './transactions.entity';

export enum RecipientType {
  USER = 'USER',
  SELLER = 'SELLER',
}

export enum AnnouncementType {
  ORDER_NEW = 'ORDER_NEW',
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  ORDER_DELIVERY = 'ORDER_DELIVERY',
  ORDER_FAILED = 'ORDER_FAILED',
  AUCTION = 'AUCTION',
  EXCHANGE_NEW_REQUEST = 'EXCHANGE_NEW_REQUEST',
  EXCHANGE_APPROVED = 'EXCHANGE_APPROVED',
  EXCHANGE_REJECTED = 'EXCHANGE_REJECTED',
  EXCHANGE_NEW_DEAL = 'EXCHANGE_NEW_DEAL',
  EXCHANGE_PAY_AVAILABLE = 'EXCHANGE_PAY_AVAILABLE',
  EXCHANGE_DELIVERY = 'EXCHANGE_DELIVERY',
  EXCHANGE_SUCCESSFUL = 'EXCHANGE_SUCCESSFUL',
  EXCHANGE_FAILED = 'EXCHANGE_FAILED',
  DELIVERY_PICKING = 'DELIVERY_PICKING',
  DELIVERY_ONGOING = 'DELIVERY_ONGOING',
  DELIVERY_FINISHED_SEND = 'DELIVERY_FINISHED_SEND',
  DELIVERY_FINISHED_RECEIVE = 'DELIVERY_FINISHED_RECEIVE',
  DELIVERY_FAILED_SEND = 'DELIVERY_FAILED_SEND',
  DELIVERY_FAILED_RECEIVE = 'DELIVERY_FAILED_RECEIVE',
  DELIVERY_RETURN = 'DELIVERY_RETURN',
  TRANSACTION_SUBTRACT = 'TRANSACTION_SUBTRACT',
  TRANSACTION_ADD = 'TRANSACTION_ADD',
  REFUND_APPROVE = 'REFUND_APPROVE',
  REFUND_REJECT = 'REFUND_REJECT',
}

@Entity('announcement')
export class Announcement extends BaseEntity {
  @ManyToOne(() => User, (user) => user.announcements, { eager: true })
  user: User;

  @ManyToOne(() => Order, (order) => order.announcements, {
    nullable: true,
    eager: true,
  })
  order: Order;

  @ManyToOne(() => Auction, (auction) => auction.announcements, {
    nullable: true,
    eager: true,
  })
  auction: Auction;

  @ManyToOne(() => Exchange, (exchange) => exchange.announcements, {
    nullable: true,
  })
  exchange: Exchange;

  @ManyToOne(() => Transaction, (transaction) => transaction.announcements, {
    nullable: true,
  })
  transaction: Transaction;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  title: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  message: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  status: string;

  @Column({
    type: 'enum',
    enum: AnnouncementType,
    nullable: true,
  })
  type: AnnouncementType;

  @Column({
    name: 'is_read',
    type: 'boolean',
    default: false,
  })
  isRead: boolean;

  @Column({
    type: 'enum',
    enum: RecipientType,
    default: RecipientType.USER,
  })
  recipientType: RecipientType;
}
