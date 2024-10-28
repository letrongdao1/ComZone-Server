import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Exchange } from './exchange.entity';
import { User } from './users.entity';
import { Transaction } from './transactions.entity';

@Entity('exchange-compensation')
export class ExchangeCompensation extends BaseEntity {
  @OneToOne(() => Exchange, (exchange) => exchange.exchangeCompensations)
  @JoinColumn({ name: 'exchange' })
  exchange: Exchange;

  @ManyToOne(() => User, (user) => user.exchangeCompensations)
  user: User;

  @Column({
    type: 'float',
    precision: 2,
    nullable: false,
  })
  price: number;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'HOLDING', 'TRANSFERRED', 'REVERTED'],
  })
  status: string;

  @OneToOne(
    () => Transaction,
    (transaction) => transaction.exchangeCompensation,
  )
  transactions: Transaction[];
}
