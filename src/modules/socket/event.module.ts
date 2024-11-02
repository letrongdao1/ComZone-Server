import { Module } from '@nestjs/common';
import { EventsGateWay } from './event.gateway';
// import { Controller } from "./.controller";

@Module({
  //   controllers: [Controller],
  providers: [EventsGateWay],
})
export class EventsModule {}
