import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { User } from './users.entity';
import { Order } from './orders.entity';
import { Auction } from './auction.entity';
import { ExchangeRequest } from './exchange-request.entity';
import { ExchangeOffer } from './exchange-offer.entity';
import { AnnouncementReadStatus } from './annoucement-read-status.entity';

@Entity('announcement')
export class Announcement extends BaseEntity {
  @ManyToOne(() => User, (user) => user.announcementReadStatuses, {
    eager: true,
  })
  user: User;

  @ManyToOne(() => Order, (order) => order.announcements, { nullable: true })
  order: Order;

  @ManyToOne(() => Auction, (auction) => auction.announcements, {
    nullable: true,
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

  @OneToMany(
    () => AnnouncementReadStatus,
    (readStatus) => readStatus.announcement,
  )
  readStatuses: AnnouncementReadStatus[];
}
