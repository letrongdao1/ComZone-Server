import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from './users.entity';
import { Order } from './orders.entity';
import { Auction } from './auction.entity';
import { Exchange } from './exchange.entity';

export enum RecipientType {
  USER = 'USER',
  SELLER = 'SELLER',
}

export enum AnnouncementType {
  ORDER = 'ORDER',
  AUCTION = 'AUCTION',
  EXCHANGE_NEW_REQUEST = 'EXCHANGE_NEW_REQUEST',
  EXCHANGE_APPROVED = 'EXCHANGE_APPROVED',
  EXCHANGE_REJECTED = 'EXCHANGE_REJECTED',
  EXCHANGE_NEW_DEAL = 'EXCHANGE_NEW_DEAL',
  EXCHANGE_PAY_AVAILABLE = 'EXCHANGE_PAY_AVAILABLE',
  EXCHANGE_DELIVERY = 'EXCHANGE_DELIVERY',
  EXCHANGE_SUCCESSFUL = 'EXCHANGE_SUCCESSFUL',
  EXCHANGE_FAILED = 'EXCHANGE_FAILED',
  DELIVERY_ONGOING = 'DELIVERY_ONGOING',
  DELIVERY_FINISHED = 'DELIVERY_FINISHED',
  DELIVERY_FAILED = 'DELIVERY_FAILED',
  DEPOSIT_WALLET = 'DEPOSIT_WALLET',
  WITHDRAW_WALLET = 'WITHDRAW_WALLET',
  DEPOSIT_MONEY = 'DEPOSIT_MONEY',
  REFUND_MONEY = 'REFUND_MONEY',
  SEIZED_MONEY = 'SEIZED_MONEY',
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
    eager: true,
  })
  exchange: Exchange;

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
