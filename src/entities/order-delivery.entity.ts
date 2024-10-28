import { Entity, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entity.base';
import { Order } from './orders.entity';

@Entity('order-delivery')
export class OrderDelivery extends BaseEntity {
  @OneToOne(() => Order, (order) => order.orderDelivery, {
    eager: true,
  })
  @JoinColumn({ name: 'order' })
  order: Order;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  province: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  district: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  ward: string;

  @Column({
    name: 'detailed_address',
    type: 'varchar',
    nullable: false,
  })
  detailedAddress: string;

  @Column({
    name: 'start_time',
    type: 'datetime',
    nullable: true,
  })
  startTime: Date;

  @Column({
    name: 'delivered_time',
    type: 'datetime',
    nullable: true,
  })
  deliveredTime: Date;

  @Column({
    type: 'text',
    nullable: true,
  })
  confimation: string;

  @Column({
    type: 'enum',
    enum: ['ONGOING', 'SUCCESSFUL', 'FAILED'],
  })
  status: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  note: string;
}
