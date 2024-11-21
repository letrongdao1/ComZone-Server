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
    this.logger.debug('Getting delivery status from GHN to update order...');
    this.ordersService.getAll();
  }
}
