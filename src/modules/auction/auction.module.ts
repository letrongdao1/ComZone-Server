import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from 'src/entities/auction.entity';
import { Comic } from 'src/entities/comics.entity';
import { AuctionController } from './auction.controller';
import { AuctionService } from './auction.service';
import { Bid } from 'src/entities/bid.entity';
import { AuctionSchedulerService } from './auctionSchedule.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comic, Auction, Bid])],
  controllers: [AuctionController],
  providers: [AuctionService, AuctionSchedulerService], // Add AuctionSchedulerService to providers
  exports: [AuctionService],
})
export class AuctionModule {}
