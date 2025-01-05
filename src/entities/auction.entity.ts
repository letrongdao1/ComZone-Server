import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { Bid } from './bid.entity';
import { Deposit } from './deposit.entity';
import { Announcement } from './announcement.entity';
import { User } from './users.entity';
import { AuctionRequest } from './auction-request.entity';
import { Comic } from './comics.entity';

@Entity('auction')
export class Auction extends BaseEntity {
  @ManyToOne(() => Comic, (comic) => comic.auction, { eager: true })
  comics: Comic;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'winner_id' })
  winner: User;

  @OneToMany(() => AuctionRequest, (request) => request.auction)
  requests: AuctionRequest[]; // Liên kết với nhiều yêu cầu đấu giá
  @Column({ nullable: true })
  reservePrice: number;

  @Column({ nullable: true })
  maxPrice: number;

  @Column({ nullable: true })
  priceStep: number;

  @Column({
    name: 'deposit_amount',
    nullable: true,
  })
  depositAmount: number;

  @Column({
    name: 'current_price',
    nullable: true,
    default: 0,
  })
  currentPrice: number;

  @Column({
    name: 'start_time',
    type: 'datetime',
    nullable: true,
  })
  startTime: Date;

  @Column({
    name: 'end_time',
    type: 'datetime',
    nullable: true,
  })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: [
      'UPCOMING',
      'ONGOING',
      'SUCCESSFUL',
      'FAILED',
      'CANCELED',
      'COMPLETED',
      'STOPPED',
    ],
  })
  status: string;

  @OneToMany(() => Bid, (bid) => bid.auction)
  bids: Bid[];

  @OneToMany(() => Deposit, (deposit) => deposit.auction)
  deposits: Deposit[];

  @OneToMany(() => Announcement, (announcement) => announcement.auction)
  announcements: Announcement[];

  @Column({ default: false })
  isPaid: boolean;

  @Column({ type: 'timestamp', nullable: true })
  paymentDeadline: Date;

  @Column({ nullable: true })
  currentCondition: string;
}
