import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';
import { Order } from './orders.entity';
import { OrderDeliveryStatusEnum } from 'src/modules/orders/dto/order-delivery-status.enum';
import { BaseEntity } from 'src/common/entity.base';
import { DeliveryInformation } from './delivery-information.entity';
import { Exchange } from './exchange.entity';
import { DeliveryOverallStatusEnum } from 'src/modules/deliveries/dto/overall-status.enum';

@Entity('delivery')
export class Delivery extends BaseEntity {
  @OneToOne(() => Order, (order) => order.delivery, {
    nullable: true,
    cascade: true,
  })
  order: Order;

  @ManyToOne(() => Exchange, (exchange) => exchange.deliveries, {
    nullable: true,
  })
  exchange: Exchange;

  @ManyToOne(() => DeliveryInformation, (info) => info.fromDeliveries, {
    eager: true,
  })
  from: DeliveryInformation;

  @ManyToOne(() => DeliveryInformation, (info) => info.toDeliveries, {
    eager: true,
  })
  to: DeliveryInformation;

  @Column({
    name: 'delivery_tracking_code',
    type: 'varchar',
    nullable: true,
  })
  deliveryTrackingCode: string;

  @Column({
    name: 'delivery_fee',
    type: 'float',
    nullable: true,
  })
  deliveryFee: number;

  @Column({
    name: 'estimated_delivery_time',
    type: 'datetime',
    nullable: true,
  })
  estimatedDeliveryTime: Date;

  @Column({
    type: 'enum',
    enum: OrderDeliveryStatusEnum,
    nullable: true,
  })
  status: string;

  @Column({
    name: 'overall_status',
    type: 'enum',
    enum: DeliveryOverallStatusEnum,
    default: DeliveryOverallStatusEnum.PICKING,
  })
  overallStatus: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  note: string;
}
