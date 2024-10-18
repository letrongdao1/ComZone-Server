import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/entity.base';
import { User } from './users.entity';
import { OrderItem } from './order-items.entity';
import { Address } from './address.entity';

@Entity('orders')
export class Order extends BaseEntity {
  @ManyToOne(() => User, (user) => user.purchased_order, {
    eager: true,
  })
  user: User;

  @ManyToOne(() => User, (user) => user.sold_order, {
    eager: true,
  })
  seller: User;

  @ManyToOne(() => Address, (address) => address.orders, {
    eager: true,
  })
  address: Address;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  code: string;

  @Column({
    type: 'float',
    precision: 2,
    nullable: false,
  })
  total_price: number;

  @Column({
    type: 'enum',
    enum: ['NON_AUCTION', 'AUCTION', 'EXCHANGE'],
    default: 'NON_AUCTION',
  })
  order_type: string;

  @Column({
    type: 'enum',
    enum: ['COD', 'WALLET'],
    default: 'COD',
  })
  payment_method: string;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  is_paid: boolean;

  @Column({
    type: 'enum',
    enum: [
      'PENDING',
      'PACKAGING',
      'DELIVERING',
      'DELIVERED',
      'SUCCESSFUL',
      'CANCELED',
    ],
    default: 'PENDING',
  })
  status: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  order_item: OrderItem[];
}
