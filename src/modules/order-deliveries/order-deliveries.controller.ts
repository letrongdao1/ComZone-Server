import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { OrderDeliveriesService } from './order-deliveries.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrderDeliveryDTO } from './dto/order-delivery.dto';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';

@ApiBearerAuth()
@ApiTags('Order deliveries')
@Controller('order-deliveries')
export class OrderDeliveriesController {
  constructor(
    private readonly orderDeliveriesService: OrderDeliveriesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createOrderDelivery(@Body() orderDeliveryDto: OrderDeliveryDTO) {
    return this.orderDeliveriesService.createOrderDelivery(orderDeliveryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':order_id')
  getOrderDelivery(@Param('order_id') orderId: string) {
    return this.orderDeliveriesService.getOrderDelivery(orderId);
  }
}
