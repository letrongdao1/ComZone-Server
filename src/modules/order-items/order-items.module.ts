import { forwardRef, Module } from '@nestjs/common';
import { OrderItemsService } from './order-items.service';
import { OrderItemsController } from './order-items.controller';
import { OrderItem } from 'src/entities/order-item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from '../orders/orders.module';
import { ComicModule } from '../comics/comics.module';

import { AnnouncementModule } from '../announcement/announcement.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderItem]),
    forwardRef(() => AnnouncementModule),
    ComicModule,
    forwardRef(() => OrdersModule),
  ],
  controllers: [OrderItemsController],
  providers: [OrderItemsService],
  exports: [OrderItemsService],
})
export class OrderItemsModule {}
