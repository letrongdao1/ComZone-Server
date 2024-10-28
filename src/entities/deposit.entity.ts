import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';
import { User } from './users.entity';
import { Auction } from './auction.entity';
import { Exchange } from './exchange.entity';
import { Transaction } from './transactions.entity';

@Entity('deposit')
export class Deposit extends BaseEntity {
  @ManyToOne(() => User, (user) => user.deposits)
  user: User;

  @ManyToOne(() => Auction, (auction) => auction.deposits)
  auction: Auction;

  @ManyToOne(() => Exchange, (exchange) => exchange.deposits)
  exchange: Exchange;

  @Column({
    type: 'float',
    precision: 2,
    nullable: false,
  })
  price: number;

  @Column({
    type: 'enum',
    enum: ['HOLDING', 'REFUNDED', 'SEIZED'],
    default: 'HOLDING',
  })
  status: string;

  @OneToOne(() => Transaction, (transaction) => transaction.deposit)
  transactions: Transaction[];
}
