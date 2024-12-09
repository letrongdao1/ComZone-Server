import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { User } from './users.entity';
import { Withdrawal } from './withdrawal.entity';

@Entity('source-of-fund')
export class SourceOfFund extends BaseEntity {
  @ManyToOne(() => User, (user) => user.sourcesOfFund)
  user: User;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  number: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  owner: string;

  @Column({
    name: 'bank-name',
    type: 'varchar',
    nullable: false,
  })
  bankName: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  logo: string;

  @OneToMany(() => Withdrawal, (withdrawal) => withdrawal)
  withdrawals: Withdrawal[];
}
