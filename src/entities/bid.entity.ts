import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from './users.entity';
import { Auction } from './auction.entity';

@Entity('bid')
export class Bid extends BaseEntity {
  @ManyToOne(() => User, (user) => user.bids, { eager: true })
  user: User;

  @ManyToOne(() => Auction, (auction) => auction.bids, {
    cascade: true,
    eager: true,
  })
  auction: Auction;

  @Column({
    type: 'float',
    precision: 2,
    nullable: false,
  })
  price: number;
}
