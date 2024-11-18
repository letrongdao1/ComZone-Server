import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from './users.entity';
import { Order } from './orders.entity';
import { Auction } from './auction.entity';
import { ExchangeRequest } from './exchange-request.entity';
import { ExchangeOffer } from './exchange-offer.entity';

@Entity('announcement')
export class Announcement extends BaseEntity {
  @ManyToOne(() => User, (user) => user.announcements, { eager: true })
  user: User;

  @ManyToOne(() => Order, (order) => order.announcements, { nullable: true })
  order: Order;

  @ManyToOne(() => Auction, (auction) => auction.announcements, {
    nullable: true,
    eager: true,
  })
  auction: Auction;

  @ManyToOne(() => ExchangeRequest, (request) => request.announcements, {
    nullable: true,
  })
  exchangeRequest: ExchangeRequest;

  @ManyToOne(() => ExchangeOffer, (offer) => offer.announcements, {
    nullable: true,
  })
  exchangeOffer: ExchangeOffer;

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
}
