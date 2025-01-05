import { Module } from '@nestjs/common';
import { AuctionRequestService } from './auction-request.service';
import { AuctionRequestController } from './auction-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionRequest } from 'src/entities/auction-request.entity';
import { Auction } from 'src/entities/auction.entity';
import { Comic } from 'src/entities/comics.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuctionRequest, Auction, Comic])],
  controllers: [AuctionRequestController],
  providers: [AuctionRequestService],
})
export class AuctionRequestModule {}
