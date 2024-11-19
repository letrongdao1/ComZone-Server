import { Module } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { DeliveriesController } from './deliveries.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delivery } from 'src/entities/delivery.entity';
import { DeliveryInformationModule } from '../delivery-information/delivery-information.module';
import { VietNamAddressModule } from '../viet-nam-address/viet-nam-address.module';
import { ComicModule } from '../comics/comics.module';
import { Order } from 'src/entities/orders.entity';
import { ExchangesModule } from '../exchanges/exchanges.module';
import { ExchangeComicsModule } from '../exchange-comics/exchange-comics.module';
import { DeliveriesScheduleService } from './delivery-schedule.service.';

@Module({
  imports: [
    TypeOrmModule.forFeature([Delivery, Order]),
    ExchangesModule,
    ExchangeComicsModule,
    DeliveryInformationModule,
    VietNamAddressModule,
    ComicModule,
  ],
  controllers: [DeliveriesController],
  providers: [DeliveriesService, DeliveriesScheduleService],
  exports: [DeliveriesService],
})
export class DeliveriesModule {}
