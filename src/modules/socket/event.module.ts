// events.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { EventsGateway } from './event.gateway';
import { BidModule } from '../bid/bid.module';
import { AnnouncementModule } from '../announcement/announcement.module';
import { AuctionModule } from '../auction/auction.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    forwardRef(() => AuctionModule),
    BidModule,
    AnnouncementModule,
    UsersModule,
  ],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
