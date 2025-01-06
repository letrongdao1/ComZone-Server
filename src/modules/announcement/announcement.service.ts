// src/announcement/announcement.service.ts
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from '../../entities/announcement.entity';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from './dto/announcement.dto';
import { Auction } from 'src/entities/auction.entity';
import { User } from 'src/entities/users.entity';
import { Exchange } from 'src/entities/exchange.entity';
import { Order } from 'src/entities/orders.entity';
import { OrderItemsService } from '../order-items/order-items.service';
import { Transaction } from 'src/entities/transactions.entity';

@Injectable()
export class AnnouncementService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepository: Repository<Announcement>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @Inject(forwardRef(() => OrderItemsService))
    private readonly orderItemService: OrderItemsService,
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
    @InjectRepository(Exchange)
    private readonly exchangeRepository: Repository<Exchange>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  // Create an announcement
  async markAsRead(announcementId: string, userId: string): Promise<void> {
    const announcement = await this.announcementRepository.findOne({
      where: {
        id: announcementId,
        user: { id: userId },
      },
    });

    if (announcement) {
      announcement.isRead = true;
      await this.announcementRepository.save(announcement);
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
    const {
      userId,
      orderId,
      auctionId,
      exchangeId,
      transactionId,
      recipientType,
      ...rest
    } = createAnnouncementDto;

    const user = userId
      ? await this.userRepository.findOne({ where: { id: userId } })
      : null;
    const order = orderId
      ? await this.orderRepository.findOne({ where: { id: orderId } })
      : null;
    const auction = auctionId
      ? await this.auctionRepository.findOne({ where: { id: auctionId } })
      : null;
    const exchange = exchangeId
      ? await this.exchangeRepository.findOne({ where: { id: exchangeId } })
      : null;
    const transaction = transactionId
      ? await this.transactionRepository.findOne({
          where: { id: transactionId },
        })
      : null;

    if (userId && !user) {
      throw new Error('User not found');
    }
    if (order && !orderId) {
      throw new Error('Order not found');
    }
    if (auctionId && !auction) {
      throw new Error('Auction not found');
    }
    if (exchangeId && !exchange) {
      throw new Error('Exchange not found');
    }
    if (transactionId && !transaction) {
      throw new Error('Transaction not found');
    }

    const announcement = this.announcementRepository.create({
      ...rest,
      user: user || undefined,
      order: order || undefined,
      auction: auction || undefined,
      exchange: exchange || undefined,
      transaction: transaction || undefined,
      recipientType,
      type: rest.type || null,
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

  async findByUserId(userId: string): Promise<any[]> {
    // Fetch announcements related to the user
    const announcements = await this.announcementRepository.find({
      where: { user: { id: userId } },
      relations: ['exchange', 'transaction', 'auctionRequest'],
      order: { createdAt: 'DESC' },
    });

    const enrichedAnnouncements = await Promise.all(
      announcements.map(async (announcement) => {
        // Ensure announcement.order contains the order ID
        if (!announcement.order) return announcement;

        // Fetch all OrderItems for the given orderId
        const orderItems = await this.orderItemService.getAllItemsOfOrder(
          announcement.order.id,
        );

        // Return the announcement with the additional orderItems and comics
        return {
          ...announcement,
          orderItems: orderItems.map((orderItem) => ({
            ...orderItem,
            comics: orderItem.comics,
          })),
        };
      }),
    );

    return enrichedAnnouncements;
  }

  async countUnreadAnnouncements(userId: string): Promise<number> {
    return this.announcementRepository.count({
      where: {
        user: { id: userId },
        isRead: false,
      },
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
  async markAllAsRead(userId: string, type?: string): Promise<void> {
    const queryBuilder = this.announcementRepository
      .createQueryBuilder()
      .update()
      .set({ isRead: true })
      .where('userId = :userId', { userId });

    if (type) {
      queryBuilder.andWhere('type = :type', { type });
    }

    await queryBuilder.execute();
  }

  // Xóa thông báo theo ID
  async remove(id: string): Promise<void> {
    await this.announcementRepository.delete(id);
  }
}
