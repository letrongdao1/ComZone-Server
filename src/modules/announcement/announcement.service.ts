// src/announcement/announcement.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from '../../entities/announcement.entity';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from './dto/announcement.dto';
import { Auction } from 'src/entities/auction.entity';
import { User } from 'src/entities/users.entity';
import { Order } from 'src/entities/orders.entity';

@Injectable()
export class AnnouncementService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepository: Repository<Announcement>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
  ) {}

  // Create an announcement
  async markAsRead(announcementId: string, userId: string): Promise<void> {
    console.log(announcementId, userId);
    const announcement = await this.announcementRepository.findOne({
      where: {
        id: announcementId,
        user: { id: userId }, // Access the `user` relation and specify `id` inside it
      },
    });

    if (announcement) {
      announcement.isRead = true; // Mark as read
      await this.announcementRepository.save(announcement); // Save the update
    } else {
      throw new Error(
        'Announcement not found or user not authorized to read it',
      );
    }
  }
  async getUnreadAnnouncement(
    userId: string,
    auctionId: string,
  ): Promise<Announcement | null> {
    return this.announcementRepository.findOne({
      where: {
        user: { id: userId },
        auction: { id: auctionId },
        isRead: false,
      },
    });
  }
  async createAnnouncement(
    createAnnouncementDto: CreateAnnouncementDto,
  ): Promise<Announcement> {
    const { userId, orderId, auctionId, exchangeId, ...rest } =
      createAnnouncementDto;

    const user = userId
      ? await this.userRepository.findOne({ where: { id: userId } })
      : null;
    const order = orderId
      ? await this.orderRepository.findOne({ where: { id: orderId } })
      : null;
    const auction = auctionId
      ? await this.auctionRepository.findOne({ where: { id: auctionId } })
      : null;

    // Throw error if the entities are not found
    if (userId && !user) {
      throw new Error('User not found');
    }
    if (orderId && !order) {
      throw new Error('Order not found');
    }
    if (auctionId && !auction) {
      throw new Error('Auction not found');
    }

    // Create the announcement and set the relationships
    const announcement = this.announcementRepository.create({
      ...rest,
      user: user || undefined,
      order: order || undefined,
      auction: auction || undefined,
      exchange: undefined,
    });

    return await this.announcementRepository.save(announcement);
  }
  // Lấy tất cả thông báo
  async findAll(): Promise<Announcement[]> {
    return this.announcementRepository.find();
  }

  // Lấy thông báo theo ID
  async findOne(id: string): Promise<Announcement> {
    return this.announcementRepository.findOne({
      where: { id },
    });
  }

  // Cập nhật thông báo theo ID
  async update(
    id: string,
    updateAnnouncementDto: UpdateAnnouncementDto,
  ): Promise<Announcement> {
    await this.announcementRepository.update(id, updateAnnouncementDto);
    return this.announcementRepository.findOne({
      where: { id },
    });
  }

  // Xóa thông báo theo ID
  async remove(id: string): Promise<void> {
    await this.announcementRepository.delete(id);
  }
}
