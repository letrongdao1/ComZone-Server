import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Comic } from './comics.entity';
import { Bid } from './bid.entity';
import { Deposit } from './deposit.entity';
import { Announcement } from './announcement.entity';
import { User } from './users.entity';

@Entity('auction')
export class Auction extends BaseEntity {
  @ManyToOne(() => Comic, (comic) => comic.auction)
  comics: Comic;

  @Column({
    name: 'reserve_price',
    type: 'float',
    precision: 2,
    nullable: false,
  })
  reservePrice: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'winner_id' }) // Define the foreign key column name
  winner: User;
  @Column({
    name: 'current_price',
    type: 'float',
    precision: 2,
    nullable: true,
    default: 0,
  })
  currentPrice: number;

  @Column({
    name: 'max_price',
    type: 'float',
    precision: 2,
    nullable: false,
  })
  maxPrice: number;

  @Column({
    name: 'price_step',
    type: 'float',
    precision: 2,
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
    enum: ['UPCOMING', 'PROCESSING', 'ONGOING', 'SUCCESSFUL', 'FAILED'],
    default: 'ONGOING',
  })
  status: string;

  @OneToMany(() => Bid, (bid) => bid.auction)
  bids: Bid[];

  @OneToMany(() => Deposit, (deposit) => deposit.auction)
  deposits: Deposit[];

  @OneToMany(() => Announcement, (announcement) => announcement.auction)
  announcements: Announcement[];
}
