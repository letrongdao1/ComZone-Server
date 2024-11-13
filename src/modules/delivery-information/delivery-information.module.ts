import { Module } from '@nestjs/common';
import { DeliveryInformationService } from './delivery-information.service';
import { DeliveryInformationController } from './delivery-information.controller';

@Module({
  controllers: [DeliveryInformationController],
  providers: [DeliveryInformationService],
})
export class DeliveryInformationModule {}
