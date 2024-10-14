import { Entity, Column, ManyToOne } from 'typeorm';
import { Comic } from './comics.entity';
import { BaseEntity } from 'src/common/entity.base';
import { User } from './users.entity';
import { Order } from './orders.entity';

@Entity('order-items')
export class OrderItem extends BaseEntity {
  @ManyToOne(() => Order, (order) => order.order_item, {
    eager: true,
  })
  order: Order;

  @ManyToOne(() => Comic, (comic) => comic.order_item, {
    eager: true,
  })
  comics: Comic;

  @Column({
    type: 'int',
    nullable: false,
    default: 1,
  })
  quantity: number;

  @Column({
    type: 'float',
    precision: 2,
    nullable: false,
  })
  price: number;

  @Column({
    type: 'float',
    precision: 2,
    nullable: false,
  })
  total_price: number;
}
