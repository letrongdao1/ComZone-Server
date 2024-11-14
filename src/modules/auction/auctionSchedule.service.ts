import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuctionService } from './auction.service';

@Injectable()
export class AuctionSchedulerService {
  private readonly logger = new Logger(AuctionSchedulerService.name);

  constructor(private readonly auctionsService: AuctionService) {}

  // Runs cron job every minute to check for ended auctions
  // @Cron('*/20 * * * * *')
  // async handleAuctionEndCheck() {
  //   this.logger.debug('Checking for ended auctions every minute...');
  //   await this.auctionsService.checkAndDeclareWinnersForEndedAuctions();
  // }
}
