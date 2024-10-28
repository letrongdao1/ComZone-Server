import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from './users.entity';
import { Auction } from './auction.entity';

@Entity('bid')
export class Bid extends BaseEntity {
  @ManyToOne(() => User, (user) => user.bids)
  user: User;

  @ManyToOne(() => Auction)
  auction: Auction;

  @Column({
    type: 'float',
    precision: 2,
    nullable: false,
  })
  price: number;
}
