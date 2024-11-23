import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuctionService } from './auction.service';

@Injectable()
export class AuctionSchedulerService {
  private readonly logger = new Logger(AuctionSchedulerService.name);

  constructor(private readonly auctionsService: AuctionService) {}

  // Runs cron job every minute to check for ended auctionsa
  @Cron(CronExpression.EVERY_MINUTE, { disabled: true })
  async handleAuctionEndCheck() {
    this.logger.debug('Checking for ended auctions every minute...');
    await this.auctionsService.checkAndDeclareWinnersForEndedAuctions();
  }
  @Cron(CronExpression.EVERY_MINUTE, { disabled: false })
  async handleAuctionStartCheck() {
    this.logger.debug('Checking for auctions to start every minute...');
    const result = await this.auctionsService.startAuctionsThatShouldBeginNow();

    if (result.success) {
      this.logger.log(
        `Started auctions successfully: ${result.startedAuctions.join(', ')}`,
      );
    } else {
      this.logger.error(
        `Errors occurred while starting auctions: ${JSON.stringify(result.errors)}`,
      );
    }
  }
}
