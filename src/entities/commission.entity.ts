import { NonPrimaryBaseEntity } from 'src/common/non-primary-entity.base';
import { Column, Entity, OneToOne } from 'typeorm';
import { Transaction } from './transactions.entity';

@Entity('commission')
export class Commission extends NonPrimaryBaseEntity {
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
