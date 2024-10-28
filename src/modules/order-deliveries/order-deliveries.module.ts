import { Module } from '@nestjs/common';
import { OrderDeliveriesService } from './order-deliveries.service';
import { OrderDeliveriesController } from './order-deliveries.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderDelivery } from 'src/entities/order-delivery.entity';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [TypeOrmModule.forFeature([OrderDelivery]), OrdersModule],
  controllers: [OrderDeliveriesController],
  providers: [OrderDeliveriesService],
})
export class OrderDeliveriesModule {}
