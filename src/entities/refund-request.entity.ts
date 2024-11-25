import { BaseEntity } from 'src/common/entity.base';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from './users.entity';
import { Exchange } from './exchange.entity';
import { Order } from './orders.entity';
import { RefundRequestStatusEnum } from 'src/modules/refund-requests/dto/status.enum';
import { Transaction } from './transactions.entity';

@Entity('refund-requests')
export class RefundRequest extends BaseEntity {
  @ManyToOne(() => User, (user) => user.refundRequests, { eager: true })
  user: User;

  @ManyToOne(() => Exchange, (exchange) => exchange.refundRequests, {
    eager: true,
  })
  exchange: Exchange;

  @OneToOne(() => Order, (exchange) => exchange.refundRequest, { eager: true })
  @JoinColumn({ name: 'order' })
  order: Order;

  @Column({
    name: 'reason',
    type: 'varchar',
  })
  reason: string;

  @Column({
    name: 'description',
    type: 'text',
  })
  description: string;

  @Column({
    name: 'attached_images',
    type: 'simple-json',
    nullable: true,
  })
  attachedImages: string[];

  @Column({
    name: 'rejected_reason',
    type: 'text',
    nullable: true,
  })
  rejectedReason: string;

  @Column({
    type: 'enum',
    enum: RefundRequestStatusEnum,
    default: RefundRequestStatusEnum.PENDING,
  })
  status: RefundRequestStatusEnum;

  @OneToMany(() => Transaction, (transaction) => transaction.refundRequest)
  transactions: Transaction[];
}
