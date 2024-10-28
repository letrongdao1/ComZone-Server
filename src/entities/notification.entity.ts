import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from './users.entity';
import { Order } from './orders.entity';
import { Auction } from './auction.entity';
import { Exchange } from './exchange.entity';

@Entity('notification')
export class Notification extends BaseEntity {
  @ManyToOne(() => User, (user) => user.notifications, { eager: true })
  user: User;

  @ManyToOne(() => Order, (order) => order.notifications)
  order: Order;

  @ManyToOne(() => Auction, (auction) => auction.notifications)
  auction: Auction;

  @ManyToOne(() => Exchange, (exchange) => exchange.notifications)
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
    name: 'is_read',
    type: 'boolean',
    default: false,
  })
  isRead: boolean;
}
