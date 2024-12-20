import { forwardRef, Module } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { DeliveriesController } from './deliveries.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delivery } from 'src/entities/delivery.entity';
import { DeliveryInformationModule } from '../delivery-information/delivery-information.module';
import { VietNamAddressModule } from '../viet-nam-address/viet-nam-address.module';
import { ComicModule } from '../comics/comics.module';
import { Order } from 'src/entities/orders.entity';
import { ExchangeComicsModule } from '../exchange-comics/exchange-comics.module';
import { DeliveriesScheduleService } from './delivery-schedule.service.';
import { UsersModule } from '../users/users.module';
import { Exchange } from 'src/entities/exchange.entity';
import { ExchangesModule } from '../exchanges/exchanges.module';
import { EventsModule } from '../socket/event.module';
import { Announcement } from 'src/entities/announcement.entity';
import { DepositsModule } from '../deposits/deposits.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Delivery, Order, Exchange, Announcement]),
    UsersModule,
    ExchangeComicsModule,
    DeliveryInformationModule,
    VietNamAddressModule,
    ComicModule,
    forwardRef(() => ExchangesModule),
    EventsModule,
    DepositsModule,
  ],
  controllers: [DeliveriesController],
  providers: [DeliveriesService, DeliveriesScheduleService],
  exports: [DeliveriesService],
})
export class DeliveriesModule {}
