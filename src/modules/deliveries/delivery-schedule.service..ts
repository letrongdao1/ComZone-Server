import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DeliveriesService } from './deliveries.service';

@Injectable()
export class DeliveriesScheduleService {
  private readonly logger = new Logger(DeliveriesScheduleService.name);

  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Cron(
    process.env.CRON_TEST_INTERVAL && Boolean(process.env.CRON_TEST_INTERVAL)
      ? CronExpression.EVERY_10_SECONDS
      : CronExpression.EVERY_MINUTE,
    {
      disabled: Boolean(process.env.CRON_DISABLED),
    },
  )
  updateDeliveryStatus() {
    this.logger.debug(
      'Getting delivery status from GHN to update deliveries...',
    );
    this.deliveriesService.getAll();
  }
}
