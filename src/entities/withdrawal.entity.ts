import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';
import { User } from './users.entity';
import { Transaction } from './transactions.entity';

@Entity('wallet-deposit')
export class Withdrawal extends BaseEntity {
  @ManyToOne(() => User, (user) => user.withdrawals, { eager: true })
  user: User;

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
  transactions: Transaction[];
}
