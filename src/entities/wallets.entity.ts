import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './users.entity';

@Entity('wallets')
export class Wallet extends BaseEntity {
  @OneToOne(() => User, (user) => user.wallet, { cascade: true, eager: true })
  @JoinColumn({ name: 'user' })
  user: User;

  @Column({
    type: 'float',
    nullable: false,
    default: 0,
  })
  balance: number;

  @Column({
    type: 'float',
    nullable: true,
    default: 0,
  })
  nonWithdrawableAmount: number;

  @Column({
    type: 'enum',
    enum: ['DISABLED', 'ACTIVATED'],
    default: 'ACTIVATED',
  })
  status: string;
}
