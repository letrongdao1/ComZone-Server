import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bid } from 'src/entities/bid.entity';
import { BidService } from './bid.service';
import { BidController } from './bid.controller';
import { Auction } from 'src/entities/auction.entity';
import { User } from 'src/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bid, Auction, User])],
  controllers: [BidController],
  providers: [BidService],
})
export class BidModule {}
