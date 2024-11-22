import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';
import { User } from './users.entity';
import { Transaction } from './transactions.entity';
import { WalletDepositStatusEnum } from 'src/modules/wallet-deposit/dto/status.enum';

@Entity('wallet-deposit')
export class WalletDeposit extends BaseEntity {
  @ManyToOne(() => User, (user) => user.walletDeposits, { eager: true })
  user: User;

  @Column({
    type: 'float',
    precision: 2,
    nullable: false,
  })
  amount: number;

  @Column({
    name: 'payment_gateway',
    type: 'varchar',
    nullable: true,
  })
  paymentGateway?: string;

  @Column({
    type: 'enum',
    enum: WalletDepositStatusEnum,
    default: WalletDepositStatusEnum.PENDING,
  })
  status: string;

  @OneToOne(() => Transaction, (transaction) => transaction.walletDeposit)
  transaction: Transaction;
}
