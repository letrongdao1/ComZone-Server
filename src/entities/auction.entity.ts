import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Comic } from './comics.entity';
import { Bid } from './bid.entity';
import { Deposit } from './deposit.entity';
import { Announcement } from './announcement.entity';
import { User } from './users.entity';

import { BeforeInsert } from 'typeorm';

@Entity('auction')
export class Auction extends BaseEntity {
  @ManyToOne(() => Comic, (comic) => comic.auction, { eager: true })
  comics: Comic;

  @Column({
    name: 'reserve_price',
    nullable: false,
  })
  reservePrice: number;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'winner_id' })
  winner: User;

  @Column({
    name: 'current_price',
    nullable: true,
    default: 0,
  })
  currentPrice: number;

  @Column({
    name: 'max_price',
    nullable: false,
  })
  maxPrice: number;

  @Column({
    name: 'price_step',
    nullable: false,
  })
  priceStep: number;

  @Column({
    name: 'start_time',
    type: 'datetime',
    nullable: false,
  })
  startTime: Date;

  @Column({
    name: 'end_time',
    type: 'datetime',
    nullable: false,
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
    ],
  })
  status: string;

  @Column({
    name: 'deposit_amount',
    nullable: false,
  })
  depositAmount: number;

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

  @BeforeInsert()
  setDefaultCurrentPrice() {
    // Set currentPrice to reservePrice before the entity is inserted
    if (this.currentPrice === 0) {
      this.currentPrice = this.reservePrice;
    }
  }
}
