import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';
import { User } from './users.entity';
import { Auction } from './auction.entity';
import { ExchangeRequest } from './exchange-request.entity';
import { Transaction } from './transactions.entity';
import { DepositStatusEnum } from 'src/modules/deposits/dto/deposit-status.enum';

@Entity('deposit')
export class Deposit extends BaseEntity {
  @ManyToOne(() => User, (user) => user.deposits, { eager: true })
  user: User;

  @ManyToOne(() => Auction, (auction) => auction.deposits, {
    nullable: true,
    eager: true,
  })
  auction: Auction;

  @ManyToOne(() => ExchangeRequest, (request) => request.deposits, {
    nullable: true,
    eager: true,
  })
  exchangeRequest: ExchangeRequest;

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

  @OneToOne(() => Transaction, (transaction) => transaction.deposit)
  transaction: Transaction;
}
