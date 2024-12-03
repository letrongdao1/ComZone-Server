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
    type: 'varchar',
    nullable: true,
  })
  type: string;

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
