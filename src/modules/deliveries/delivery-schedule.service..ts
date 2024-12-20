import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DeliveriesService } from './deliveries.service';

@Injectable()
export class DeliveriesScheduleService {
  private readonly logger = new Logger(DeliveriesScheduleService.name);

  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Cron(
    process.env.CRON_TEST_INTERVAL && process.env.CRON_TEST_INTERVAL === 'TRUE'
      ? CronExpression.EVERY_10_SECONDS
      : CronExpression.EVERY_MINUTE,
    {
      disabled:
        process.env.CRON_DISABLED && process.env.CRON_DISABLED === 'TRUE',
    },
  )
  updateDeliveryStatus() {
    this.logger.debug(
      'Getting delivery status from GHN to update deliveries...',
    );
    this.deliveriesService.getAll();
  }

  @Cron(
    process.env.CRON_TEST_INTERVAL && process.env.CRON_TEST_INTERVAL === 'TRUE'
      ? CronExpression.EVERY_10_SECONDS
      : CronExpression.EVERY_MINUTE,
    {
      disabled:
        process.env.CRON_DISABLED && process.env.CRON_DISABLED === 'TRUE',
    },
  )
  checkExpiredExchangeDelivery() {
    this.logger.debug('Checking for expired exchange delivery...');
    this.deliveriesService.checkForExpiredDelivery();
  }
}
