import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/entities/orders.entity';
import { OrderItem } from 'src/entities/order-item.entity';
import { ComicModule } from '../comics/comics.module';
import { UserAddressesModule } from '../user-addresses/user-addresses.module';
import { DeliveriesModule } from '../deliveries/deliveries.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    ComicModule,
    UserAddressesModule,
    DeliveriesModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
