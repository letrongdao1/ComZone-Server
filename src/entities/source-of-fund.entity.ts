import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { User } from './users.entity';
import { Withdrawal } from './withdrawal.entity';

@Entity('source-of-fund')
export class SourceOfFund extends BaseEntity {
  @ManyToMany(() => User, (user) => user.sourcesOfFund)
  user: User;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  name: string;

  @OneToMany(() => Withdrawal, (withdrawal) => withdrawal)
  withdrawals: Withdrawal[];
}
