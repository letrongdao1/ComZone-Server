import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from 'src/common/entity.base';
import { User } from './users.entity';
import { OrderItem } from './order-item.entity';
import { Transaction } from './transactions.entity';
import { Announcement } from './announcement.entity';
import { Delivery } from './delivery.entity';
import { OrderStatusEnum } from 'src/modules/orders/dto/order-status.enum';
import { OrderTypeEnum } from 'src/modules/orders/dto/order-type.enum';
import { RefundRequest } from './refund-request.entity';

@Entity('orders')
export class Order extends BaseEntity {
  @ManyToOne(() => User, (user) => user.purchased_order, {
    eager: true,
  })
  user: User;

  @OneToOne(() => Delivery, (delivery) => delivery.order, { eager: true })
  @JoinColumn({ name: 'delivery' })
  delivery: Delivery;

  @Column({
    type: 'varchar',
    unique: true,
  })
  code: string;

  @Column({
    name: 'total_price',
    type: 'float',
    precision: 2,
    nullable: false,
  })
  totalPrice: number;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: ['COD', 'WALLET'],
  })
  paymentMethod: 'COD' | 'WALLET';

  @Column({
    name: 'is_paid',
    type: 'boolean',
    default: false,
  })
  isPaid: boolean;

  @Column({
    type: 'enum',
    enum: OrderTypeEnum,
  })
  type: string;

  @Column({
    type: 'enum',
    enum: OrderStatusEnum,
    default: OrderStatusEnum.PENDING,
  })
  status: OrderStatusEnum;

  @Column({
    name: 'cancel_reason',
    type: 'varchar',
    nullable: true,
  })
  cancelReason: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  note: string;

  @Column({
    type: 'simple-json',
    nullable: true,
  })
  packageImages: string[];

  @Column({
    name: 'is_feedback',
    type: 'boolean',
    nullable: true,
    default: false,
  })
  isFeedback: boolean;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: OrderItem[];

  @OneToMany(() => Transaction, (transaction) => transaction.order)
  transactions: Transaction[];

  @OneToOne(() => RefundRequest, (request) => request.order)
  refundRequest: RefundRequest;

  @OneToMany(() => Announcement, (announcement) => announcement.order)
  announcements: Announcement[];
}
