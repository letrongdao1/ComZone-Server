import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDelivery } from 'src/entities/order-delivery.entity';
import { Repository } from 'typeorm';
import { OrdersService } from '../orders/orders.service';
import { OrderDeliveryDTO } from './dto/order-delivery.dto';

@Injectable()
export class OrderDeliveriesService {
  constructor(
    @InjectRepository(OrderDelivery)
    private readonly orderDeliveriesRepository: Repository<OrderDelivery>,
    @Inject() private readonly ordersService: OrdersService,
  ) {}

  async createOrderDelivery(orderDeliveryDto: OrderDeliveryDTO) {
    const order = await this.ordersService.getOne(orderDeliveryDto.orderId);
    if (!order) throw new NotFoundException('Order cannot be found!');

    const orderDelivery = this.orderDeliveriesRepository.create({
      order,
      ...orderDeliveryDto,
    });

    return await this.orderDeliveriesRepository.save(orderDelivery);
  }

  async getOrderDelivery(orderId: string) {
    return await this.orderDeliveriesRepository.findOne({
      where: { order: { id: orderId } },
    });
  }
}
