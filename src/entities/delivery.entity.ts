import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { Order } from './orders.entity';
import { ExchangeRequest } from './exchange-request.entity';
import { ExchangeOffer } from './exchange-offer.entity';
import { OrderDeliveryStatusEnum } from 'src/modules/orders/dto/order-delivery-status.enum';
import { BaseEntity } from 'src/common/entity.base';
import { DeliveryInformation } from './delivery-information.entity';

@Entity('delivery')
export class Delivery extends BaseEntity {
  @OneToOne(() => Order, (order) => order.delivery)
  order: Order;

  @OneToOne(() => ExchangeRequest, (request) => request.delivery)
  exchangeRequest: ExchangeRequest;

  @OneToOne(() => ExchangeOffer, (request) => request.delivery)
  exchangeOffer: ExchangeOffer;

  @OneToOne(() => DeliveryInformation, (info) => info.from)
  @JoinColumn({ name: 'from_delivery_information' })
  from: DeliveryInformation;

  @OneToOne(() => DeliveryInformation, (info) => info.to)
  @JoinColumn({ name: 'to_delivery_information' })
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
