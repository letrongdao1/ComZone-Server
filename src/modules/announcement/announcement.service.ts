// src/announcement/announcement.service.ts
import { Injectable } from '@nestjs/common';
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
import { ExchangeRequest } from 'src/entities/exchange-request.entity';
import { ExchangeOffer } from 'src/entities/exchange-offer.entity';

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
    @InjectRepository(ExchangeRequest)
    private readonly exchangeRequestRepository: Repository<ExchangeRequest>,
    @InjectRepository(ExchangeOffer)
    private readonly exchangeOfferRepository: Repository<ExchangeOffer>,
  ) {}

  // Create an announcement
  async createAnnouncement(
    createAnnouncementDto: CreateAnnouncementDto,
  ): Promise<Announcement> {
    const {
      userId,
      orderId,
      auctionId,
      exchangeRequestId,
      exchangeOfferId,
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
    const exchangeRequest = exchangeRequestId
      ? await this.exchangeRequestRepository.findOne({
          where: { id: exchangeRequestId },
        })
      : null;
    const exchangeOffer = exchangeOfferId
      ? await this.exchangeOfferRepository.findOne({
          where: { id: exchangeOfferId },
        })
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
    if (exchangeRequestId && !exchangeRequest) {
      throw new Error('Exchange request not found');
    }
    if (exchangeOfferId && !exchangeOffer) {
      throw new Error('Exchange offer not found');
    }

    // Create the announcement and set the relationships
    const announcement = this.announcementRepository.create({
      ...rest,
      user: user || undefined,
      order: order || undefined,
      auction: auction || undefined,
      exchangeRequest: exchangeRequest || undefined,
      exchangeOffer: exchangeOffer || undefined,
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
