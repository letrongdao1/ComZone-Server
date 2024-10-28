import { Column, Entity, OneToOne } from 'typeorm';
import { Transaction } from './transactions.entity';
import { BaseEntity } from 'src/common/entity.base';

@Entity('commission')
export class Commission extends BaseEntity {
  @OneToOne(() => Transaction, (transaction) => transaction.commission, {
    eager: true,
  })
  transaction: Transaction;

  @Column({
    type: 'float',
    precision: 2,
    nullable: false,
  })
  amount: number;

  @Column({
    name: 'percentage_value',
    type: 'float',
    precision: 2,
    nullable: true,
  })
  percentageValue: number;
}
