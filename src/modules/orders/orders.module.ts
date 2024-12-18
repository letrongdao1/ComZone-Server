import { forwardRef, Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/entities/orders.entity';
import { OrderItem } from 'src/entities/order-item.entity';
import { ComicModule } from '../comics/comics.module';
import { UserAddressesModule } from '../user-addresses/user-addresses.module';
import { DeliveriesModule } from '../deliveries/deliveries.module';
import { OrdersScheduleService } from './order-schedule.service.';
import { TransactionsModule } from '../transactions/transactions.module';
import { EventsModule } from '../socket/event.module';
import { RefundRequest } from 'src/entities/refund-request.entity';
import { VietNamAddressModule } from '../viet-nam-address/viet-nam-address.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, RefundRequest]),
    ComicModule,
    UserAddressesModule,
    DeliveriesModule,
    TransactionsModule,
    VietNamAddressModule,
    forwardRef(() => EventsModule),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersScheduleService],
  exports: [OrdersService],
})
export class OrdersModule {}
