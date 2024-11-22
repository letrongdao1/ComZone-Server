import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { User } from './users.entity';
import { Auction } from './auction.entity';
import { Transaction } from './transactions.entity';
import { DepositStatusEnum } from 'src/modules/deposits/dto/deposit-status.enum';
import { Exchange } from './exchange.entity';

@Entity('deposit')
export class Deposit extends BaseEntity {
  @ManyToOne(() => User, (user) => user.deposits, { eager: true })
  user: User;

  @ManyToOne(() => Auction, (auction) => auction.deposits, {
    nullable: true,
    eager: true,
  })
  auction: Auction;

  @ManyToOne(() => Exchange, (exchange) => exchange.deposits, {
    nullable: true,
    eager: true,
  })
  exchange: Exchange;

  @Column({
    type: 'float',
    nullable: false,
  })
  amount: number;

  @Column({
    type: 'enum',
    enum: DepositStatusEnum,
    default: DepositStatusEnum.HOLDING,
  })
  status: string;

  @Column({
    name: 'seized_reason',
    type: 'varchar',
    nullable: true,
  })
  seizedReason: string;

  @OneToMany(() => Transaction, (transaction) => transaction.deposit)
  transactions: Transaction[];
}
