import { Module } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { DeliveriesController } from './deliveries.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delivery } from 'src/entities/delivery.entity';
import { ExchangeRequestsModule } from '../exchange-requests/exchange-requests.module';
import { ExchangeOffersModule } from '../exchange-offers/exchange-offers.module';
import { DeliveryInformationModule } from '../delivery-information/delivery-information.module';
import { VietNamAddressModule } from '../viet-nam-address/viet-nam-address.module';
import { ComicModule } from '../comics/comics.module';
import { Order } from 'src/entities/orders.entity';
import { ExchangesModule } from '../exchanges/exchanges.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Delivery, Order]),
    ExchangesModule,
    ExchangeOffersModule,
    DeliveryInformationModule,
    VietNamAddressModule,
    ComicModule,
  ],
  controllers: [DeliveriesController],
  providers: [DeliveriesService],
  exports: [DeliveriesService],
})
export class DeliveriesModule {}
