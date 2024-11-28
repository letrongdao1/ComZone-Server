// events.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { EventsGateway } from './event.gateway';
import { BidModule } from '../bid/bid.module';
import { AnnouncementModule } from '../announcement/announcement.module';
import { AuctionModule } from '../auction/auction.module';
import { UsersModule } from '../users/users.module';
import { DepositsModule } from '../deposits/deposits.module';

@Module({
  imports: [
    forwardRef(() => AuctionModule),
    BidModule,
    forwardRef(() => AnnouncementModule),
    UsersModule,
    DepositsModule,
  ],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
