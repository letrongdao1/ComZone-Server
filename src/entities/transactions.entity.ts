import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from './users.entity';

@Entity('transactions')
export class Transaction extends BaseEntity {
  @ManyToOne(() => User, (user) => user.transactions, { eager: true })
  user: User;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  code: string;

  @Column({
    type: 'float',
    nullable: false,
  })
  amount: number;

  @Column({
    type: 'enum',
    enum: ['DEPOSIT', 'WITHDRAWAL', 'PAY'],
    nullable: false,
    default: 'PAY',
  })
  type: string;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'SUCCESSFUL', 'FAILED'],
    nullable: false,
    default: 'PENDING',
  })
  status: string;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isUsed: boolean;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  provider: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  note: string;
}
