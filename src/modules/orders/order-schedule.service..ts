import { Injectable, Logger } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class OrdersScheduleService {
  private readonly logger = new Logger(OrdersScheduleService.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Cron(
    process.env.CRON_TEST_INTERVAL && process.env.CRON_TEST_INTERVAL === 'TRUE'
      ? CronExpression.EVERY_10_SECONDS
      : CronExpression.EVERY_MINUTE,
    {
      disabled:
        process.env.CRON_DISABLED && process.env.CRON_DISABLED === 'TRUE',
    },
  )
  updateDeliveredOrdersEveryHalfDay() {
    this.logger.debug("Updating hang delivered orders' status...");
    this.ordersService.completeHangingDeliveredOrders();
  }
}
