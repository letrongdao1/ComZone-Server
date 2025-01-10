import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Comic } from './comics.entity';
import { Auction } from './auction.entity';
import { Announcement } from './announcement.entity';

@Entity('auction_request')
export class AuctionRequest extends BaseEntity {
  @ManyToOne(() => Comic, (comic) => comic.auctionRequests, { eager: true })
  comic: Comic;

  @ManyToOne(() => Auction, (auction) => auction.requests, { nullable: true })
  @JoinColumn({ name: 'auction_id' })
  auction: Auction;

  @OneToMany(() => Announcement, (announcement) => announcement.auctionRequest)
  announcements: Announcement[];

  @Column({ nullable: false })
  reservePrice: number;

  @Column({ nullable: false })
  maxPrice: number;

  @Column({ nullable: false })
  priceStep: number;

  @Column({
    name: 'deposit_amount',
    nullable: false,
  })
  depositAmount: number;

  @Column({
    nullable: false,
  })
  duration: number;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  })
  status: string;

  @Column('json', { nullable: true })
  rejectionReason: string[];

  @Column({ type: 'timestamp', nullable: true })
  approvalDate: Date;
}
