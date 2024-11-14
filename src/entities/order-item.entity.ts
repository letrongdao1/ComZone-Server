import { Entity, Column, ManyToOne } from 'typeorm';
import { Comic } from './comics.entity';
import { BaseEntity } from 'src/common/entity.base';
import { Order } from './orders.entity';

@Entity('order-item')
export class OrderItem extends BaseEntity {
  @ManyToOne(() => Order, (order) => order.orderItem, {
    eager: true,
    cascade: true,
  })
  order: Order;

  @ManyToOne(() => Comic, (comic) => comic.order_item, {
    eager: true,
    cascade: true,
  })
  comics: Comic;

  @Column({
    type: 'float',
    precision: 2,
    nullable: false,
  })
  price: number;
}
