// events.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { EventsGateway } from './event.gateway';
import { BidModule } from '../bid/bid.module';
import { AnnouncementModule } from '../announcement/announcement.module';
import { AuctionModule } from '../auction/auction.module';

@Module({
  imports: [
    forwardRef(() => AuctionModule),
    BidModule, // Ensure BidService is provided here
    AnnouncementModule, // Ensure AnnouncementService is provided here
  ],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
