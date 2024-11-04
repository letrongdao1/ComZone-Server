import { Entity, Column, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/common/entity.base';
import { User } from './users.entity';
import { OrderItem } from './order-item.entity';
import { Transaction } from './transactions.entity';
import { Notification } from './notification.entity';
import { OrderDeliveryStatusEnum } from 'src/modules/orders/dto/order-delivery-status.enum';

@Entity('orders')
export class Order extends BaseEntity {
  @ManyToOne(() => User, (user) => user.purchased_order, {
    eager: true,
  })
  user: User;

  @Column({
    name: 'delivery_tracking_code',
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  deliveryTrackingCode: string;

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
    name: 'from_name',
    type: 'varchar',
  })
  fromName: string;

  @Column({
    name: 'from_phone',
    type: 'varchar',
  })
  fromPhone: string;

  @Column({
    name: 'from_address',
    type: 'varchar',
  })
  fromAddress: string;

  @Column({
    name: 'from_province_name',
    type: 'varchar',
  })
  fromProvinceName: string;

  @Column({
    name: 'from_district_id',
    type: 'int',
  })
  fromDistrictId: number;

  @Column({
    name: 'from_district_name',
    type: 'varchar',
  })
  fromDistrictName: string;

  @Column({
    name: 'from_ward_id',
    type: 'varchar',
  })
  fromWardId: string;

  @Column({
    name: 'from_ward_name',
    type: 'varchar',
  })
  fromWardName: string;

  @Column({
    name: 'to_name',
    type: 'varchar',
  })
  toName: string;

  @Column({
    name: 'to_phone',
    type: 'varchar',
  })
  toPhone: string;

  @Column({
    name: 'to_address',
    type: 'varchar',
  })
  toAddress: string;

  @Column({
    name: 'to_district_id',
    type: 'int',
  })
  toDistrictId: number;

  @Column({
    name: 'to_ward_id',
    type: 'varchar',
  })
  toWardId: string;

  @Column({
    name: 'delivery_fee',
    type: 'float',
  })
  deliveryFee: number;

  @Column({
    name: 'delivery_status',
    type: 'enum',
    enum: OrderDeliveryStatusEnum,
    nullable: true,
  })
  deliveryStatus: string;

  @Column({
    name: 'is_paid',
    type: 'boolean',
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
    type: 'text',
    nullable: true,
  })
  note: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItem: OrderItem[];

  @OneToOne(() => Transaction, (transaction) => transaction.order)
  transaction: Transaction;

  @OneToMany(() => Notification, (notification) => notification.order)
  notifications: Notification[];
}
