import { Entity, Column, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/common/entity.base';
import { User } from './users.entity';
import { OrderItem } from './order-item.entity';
import { Address } from './address.entity';
import { OrderDelivery } from './order-delivery.entity';
import { Transaction } from './transactions.entity';
import { Notification } from './notification.entity';

@Entity('orders')
export class Order extends BaseEntity {
  @ManyToOne(() => User, (user) => user.purchased_order, {
    eager: true,
  })
  user: User;

  @Column({
    type: 'varchar',
    nullable: false,
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
    default: 'WALLET',
  })
  paymentMethod: string;

  @Column({
    name: 'is_paid',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isPaid: boolean;

  @Column({
    type: 'enum',
    enum: [
      'PENDING',
      'PACKAGING',
      'DELIVERING',
      'DELIVERED',
      'COMPLETED',
      'CANCELED',
    ],
    default: 'PENDING',
  })
  status: string;

  @Column({
    name: 'cancel_reason',
    type: 'varchar',
    nullable: true,
  })
  cancelReason: string;

  @Column({
    name: 'note',
    type: 'text',
    nullable: true,
  })
  note: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItem: OrderItem[];

  @OneToOne(() => OrderDelivery, (orderDelivery) => orderDelivery.order)
  orderDelivery: OrderDelivery;

  @OneToOne(() => Transaction, (transaction) => transaction.order)
  transactions: Transaction[];

  @OneToMany(() => Notification, (notification) => notification.order)
  notifications: Notification[];
}
