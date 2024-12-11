import { Injectable, Logger } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class OrdersScheduleService {
  private readonly logger = new Logger(OrdersScheduleService.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Cron(CronExpression.EVERY_MINUTE, {
    disabled: false,
  })
  updateDeliveredOrdersEveryHalfDay() {
    this.logger.debug("Updating hang delivered orders' status...");
    this.ordersService.completeHangingDeliveredOrders();
  }
}
