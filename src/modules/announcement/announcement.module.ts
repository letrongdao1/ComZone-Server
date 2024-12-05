// src/announcement/announcement.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Announcement } from '../../entities/announcement.entity';
import { AnnouncementService } from './announcement.service';
import { AnnouncementController } from './announcement.controller';
import { Auction } from 'src/entities/auction.entity';
import { User } from 'src/entities/users.entity';
import { Exchange } from 'src/entities/exchange.entity';

import { OrderItemsModule } from '../order-items/order-items.module';
import { Order } from 'src/entities/orders.entity';
import { Transaction } from 'src/entities/transactions.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Announcement,
      Order,
      Auction,
      User,
      Exchange,
      Transaction,
    ]),
    // UsersModule,
    forwardRef(() => OrderItemsModule),
  ],
  exports: [AnnouncementService],
  controllers: [AnnouncementController],
  providers: [AnnouncementService],
})
export class AnnouncementModule {}
