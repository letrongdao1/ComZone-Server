// events.module.ts
import { Module } from '@nestjs/common';
import { EventsGateway } from './event.gateway';
import { BidModule } from '../bid/bid.module';
import { AnnouncementModule } from '../announcement/announcement.module';

@Module({
  exports: [EventsGateway], // Export EventsGateway here
  imports: [BidModule, AnnouncementModule],
  providers: [EventsGateway],
})
export class EventsModule {}
