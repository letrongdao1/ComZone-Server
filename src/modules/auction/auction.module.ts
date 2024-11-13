// auction.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from 'src/entities/auction.entity';
import { Comic } from 'src/entities/comics.entity';
import { AuctionController } from './auction.controller';
import { AuctionService } from './auction.service';
import { Bid } from 'src/entities/bid.entity';
import { AuctionSchedulerService } from './auctionSchedule.service';

import { Announcement } from 'src/entities/announcement.entity';
import { EventsModule } from '../socket/event.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auction, Comic, Bid, Announcement]),
    EventsModule, // Import EventsModule to access EventsGateway
  ],
  controllers: [AuctionController],
  providers: [AuctionService, AuctionSchedulerService],
  exports: [AuctionService], // Export AuctionService if you need to use it in other modules
})
export class AuctionModule {}
