import { Module } from '@nestjs/common';
import { EventsGateway } from './event.gateway';
import { BidModule } from '../bid/bid.module';
// import { Controller } from "./.controller";

@Module({
  //   controllers: [Controller],
  imports: [BidModule],
  providers: [EventsGateway],
})
export class EventsModule {}
