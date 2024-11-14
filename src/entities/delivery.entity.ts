import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Order } from './orders.entity';
import { ExchangeRequest } from './exchange-request.entity';
import { ExchangeOffer } from './exchange-offer.entity';
import { OrderDeliveryStatusEnum } from 'src/modules/orders/dto/order-delivery-status.enum';
import { BaseEntity } from 'src/common/entity.base';
import { DeliveryInformation } from './delivery-information.entity';

@Entity('delivery')
export class Delivery extends BaseEntity {
  @OneToOne(() => Order, (order) => order.delivery, {
    nullable: true,
    cascade: true,
  })
  order: Order;

  @ManyToOne(() => ExchangeRequest, (request) => request.deliveries, {
    nullable: true,
  })
  exchangeRequest: ExchangeRequest;

  @ManyToOne(() => ExchangeOffer, (offer) => offer.deliveries, {
    nullable: true,
  })
  exchangeOffer: ExchangeOffer;

  @ManyToOne(() => DeliveryInformation, (info) => info.fromDeliveries)
  from: DeliveryInformation;

  @ManyToOne(() => DeliveryInformation, (info) => info.toDeliveries)
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
    type: 'text',
    nullable: true,
  })
  note: string;
}
