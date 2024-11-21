// src/announcement/announcement.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Announcement } from '../../entities/announcement.entity';
import { AnnouncementService } from './announcement.service';
import { AnnouncementController } from './announcement.controller';
import { Order } from 'src/entities/orders.entity';
import { Auction } from 'src/entities/auction.entity';
import { User } from 'src/entities/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Announcement, Order, Auction, User]),
    // UsersModule,
  ],
  exports: [AnnouncementService],
  controllers: [AnnouncementController],
  providers: [AnnouncementService],
})
export class AnnouncementModule {}
