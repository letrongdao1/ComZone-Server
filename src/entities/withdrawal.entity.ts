import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';
import { User } from './users.entity';
import { Transaction } from './transactions.entity';
import { SourceOfFund } from './source-of-fund.entity';

@Entity('wallet-deposit')
export class Withdrawal extends BaseEntity {
  @ManyToOne(() => SourceOfFund, (sof) => sof.withdrawals, { eager: true })
  sourceOfFund: SourceOfFund;

  @Column({
    type: 'float',
    precision: 2,
    nullable: false,
  })
  amount: number;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'SUCCESSFUL', 'FAILED'],
    default: 'PENDING',
  })
  status: string;

  @OneToOne(() => Transaction, (transaction) => transaction.withdrawal)
  transaction: Transaction;
}
