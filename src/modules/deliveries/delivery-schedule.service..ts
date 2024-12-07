import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DeliveriesService } from './deliveries.service';

@Injectable()
export class DeliveriesScheduleService {
  private readonly logger = new Logger(DeliveriesScheduleService.name);

  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Cron(CronExpression.EVERY_10_SECONDS, {
    disabled: false,
  })
  updateDeliveryStatus() {
    this.logger.debug(
      'Getting delivery status from GHN to update deliveries...',
    );
    this.deliveriesService.getAll();
  }
}
