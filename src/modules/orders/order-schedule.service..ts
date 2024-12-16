import { Injectable, Logger } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class OrdersScheduleService {
  private readonly logger = new Logger(OrdersScheduleService.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Cron(
    process.env.CRON_TEST_INTERVAL && Boolean(process.env.CRON_TEST_INTERVAL)
      ? CronExpression.EVERY_10_SECONDS
      : CronExpression.EVERY_MINUTE,
    {
      disabled: Boolean(process.env.CRON_DISABLED),
    },
  )
  updateDeliveredOrdersEveryHalfDay() {
    this.logger.debug("Updating hang delivered orders' status...");
    this.ordersService.completeHangingDeliveredOrders();
  }
}
