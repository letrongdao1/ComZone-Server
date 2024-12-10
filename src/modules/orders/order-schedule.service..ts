import { Injectable, Logger } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class OrdersScheduleService {
  private readonly logger = new Logger(OrdersScheduleService.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Cron(CronExpression.EVERY_MINUTE, {
    disabled: true,
  })
  updateOrderStatus() {
    this.logger.debug('Auto updating order status...');
    this.ordersService.getAll();
  }

  @Cron(CronExpression.EVERY_12_HOURS, {
    disabled: false,
  })
  updateDeliveredOrdersEveryHalfDay() {
    this.logger.debug('Updating hang delivered order status...');
    this.ordersService.completeHangingDeliveredOrders();
  }
}
