import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, MoreThan, Not, Repository } from 'typeorm';
import { Auction } from '../../entities/auction.entity';
import { CreateAuctionDto, UpdateAuctionDto } from './dto/auction.dto';
import { Comic } from 'src/entities/comics.entity';
import { Bid } from 'src/entities/bid.entity';
import {
  Announcement,
  AnnouncementType,
  RecipientType,
} from 'src/entities/announcement.entity';
import { EventsGateway } from '../socket/event.gateway';
import { User } from 'src/entities/users.entity';
import { ComicsTypeEnum } from '../comics/dto/comic-type.enum';
import { BidService } from '../bid/bid.service';
import { DepositsService } from '../deposits/deposits.service';
import { ComicsStatusEnum } from '../comics/dto/comic-status.enum';

@Injectable()
export class AuctionService {
  constructor(
    @InjectRepository(Auction)
    private auctionRepository: Repository<Auction>,
    @InjectRepository(Comic)
    private comicRepository: Repository<Comic>,
    @InjectRepository(Bid) private bidReposistory: Repository<Bid>,
    @InjectRepository(Announcement)
    private announcementRepository: Repository<Announcement>,
    private readonly bidService: BidService,
    @Inject(forwardRef(() => EventsGateway))
    private readonly eventsGateway: EventsGateway,
    @Inject(forwardRef(() => DepositsService))
    private depositsService: DepositsService,
  ) {}

  async createAuction(data: CreateAuctionDto): Promise<Auction> {
    // Retrieve the comic
    const comic = await this.comicRepository.findOne({
      where: { id: data.comicsId },
    });

    if (!comic) {
      throw new NotFoundException(`Comic with ID ${data.comicsId} not found`);
    }

    comic.status = ComicsStatusEnum.AVAILABLE;
    comic.type = ComicsTypeEnum.AUCTION;
    comic.onSaleSince = new Date(Date.now());
    await this.comicRepository.save(comic);

    // Create a new auction and associate it with the comic
    const auction = this.auctionRepository.create({
      ...data,
      comics: comic,
    });
    auction.currentPrice = auction.reservePrice;
    return this.auctionRepository.save(auction);
  }
  async checkAndDeclareWinnersForEndedAuctions() {
    const now = new Date();
    console.log('now', now);

    const endedAuctions = await this.auctionRepository.find({
      where: { endTime: LessThanOrEqual(now), status: 'ONGOING' },
      relations: ['bids', 'bids.user'], // Include bids with users
    });

    // Use Promise.all to handle each ended auction concurrently
    await Promise.all(
      endedAuctions.map(async (auction) => {
        await this.declareWinner(auction.id);
      }),
    );
    return endedAuctions;
  }

  // Declare winner for a single auction
  async declareWinner(auctionId: string): Promise<void> {
    const auction = await this.auctionRepository.findOne({
      where: { id: auctionId },
      relations: ['bids', 'bids.user', 'comics'],
    });
    if (!auction) throw new NotFoundException('Auction not found');

    const now = new Date();
    if (auction.endTime > now) {
      return; // Auction hasn't ended yet
    }

    if (auction.bids.length > 0) {
      // Find the highest bid
      const latestBid = auction.bids.reduce((highest, bid) =>
        bid.price > highest.price ? bid : highest,
      );
      auction.paymentDeadline = new Date(
        new Date().getTime() + 7 * 24 * 60 * 60 * 1000,
      );
      auction.status = 'SUCCESSFUL';
      auction.winner = latestBid.user;
      await this.auctionRepository.save(auction);

      // Notify the winning bidder in real-time
      this.eventsGateway.notifyUser(
        latestBid.user.id,
        `Xin chúc mừng! Bạn đã chiến thắng đấu giá ${auction.comics.title}.`,
        { auctionId: auction },
        'Kết quả đấu giá',
        AnnouncementType.AUCTION,
        RecipientType.USER,
        'SUCCESSFUL',
      );
      this.eventsGateway.notifyUser(
        auction.comics.sellerId.id,
        `Buổi đấu giá ${auction.comics.title} đã diễn ra thành công.`,
        { auctionId: auction },
        'Đấu giá',
        AnnouncementType.AUCTION,
        RecipientType.SELLER,
      );

      // Collect all losing bidders' userIds
      const losingUserIds = Array.from(
        new Set(
          auction.bids
            .filter((bid) => bid.user.id !== latestBid.user.id)
            .map((bid) => bid.user.id),
        ),
      );
      await this.depositsService.refundAllDepositsExceptWinner(
        auctionId,
        latestBid.user.id,
      );
      // Create Announcements for Losing Bidders and Notify Them
      await this.eventsGateway.notifyUsers(
        losingUserIds,
        `Bạn đã đấu giá ${auction.comics.title} thất bại. Tiền cọc ${auction.depositAmount.toLocaleString('vi-VN')} đã được hoàn trả.`,
        { id: auction },
        'Kết quả đấu giá',
        AnnouncementType.AUCTION,
        'FAILED',
        RecipientType.USER,
      );
    } else {
      // No bids, so the auction failed
      auction.status = 'CANCELED';
      auction.currentCondition = 'Buổi đấu giá thất bại do không ai tham gia';
      await this.auctionRepository.save(auction);
      const depositorIds = await this.depositsService.getAllDepositOfAnAuction(
        auction.id,
      );
      const depositUserIds = depositorIds.map((deposit) => deposit.user.id);

      for (const deposit of depositorIds) {
        try {
          await this.depositsService.refundDepositToAUser(deposit.id);
        } catch (error) {
          console.error(
            `Failed to refund deposit for user ${deposit.user.id}:`,
            error.message,
          );
        }
      }
      this.eventsGateway.notifyUsers(
        depositUserIds,
        `Bạn đã đấu giá ${auction.comics.title} thất bại. Tiền cọc ${auction.depositAmount.toLocaleString('vi-VN')} đã được hoàn trả.`,
        { id: auction },
        'Kết quả đấu giá',
        AnnouncementType.AUCTION,
        'FAILED',
        RecipientType.USER,
      );
      this.eventsGateway.notifyUser(
        auction.comics.sellerId.id,
        `Buổi đấu giá ${auction.comics.title} thất bại do không ai tham gia.`,
        { auctionId: auction },
        'Đấu giá',
        AnnouncementType.AUCTION,
        RecipientType.SELLER,
      );
    }
  }

  // Get all auctions
  async findAllAuctions(): Promise<Auction[]> {
    return this.auctionRepository.find({
      relations: ['comics', 'comics.genres'], // Add 'comics.genres' to retrieve genres
    });
  }
  // Get a single auction by ID
  async findAuctionById(id: string): Promise<Auction> {
    const auction = await this.auctionRepository.findOne({
      where: { id },
      relations: ['comics', 'comics.genres'],
    });
    if (!auction) {
      throw new NotFoundException(`Auction with ID ${id} not found`);
    }
    return auction;
  }
  async findAuctionsExcludingUser(sellerId: string): Promise<Auction[]> {
    return this.auctionRepository.find({
      where: {
        comics: {
          sellerId: { id: Not(sellerId) },
        },
      },
      relations: ['comics', 'comics.genres'],
    });
  }

  async findAuctionBySeller(sellerId: string): Promise<Auction[]> {
    return await this.auctionRepository.find({
      where: {
        comics: {
          sellerId: { id: sellerId },
        },
      },
      relations: ['comics', 'comics.genres'],
    });
  }

  async getActiveAuctionsBySeller(sellerId: string): Promise<Auction[]> {
    return await this.auctionRepository.find({
      where: {
        comics: {
          sellerId: { id: sellerId },
        },
        status: Not(In(['FAILED', 'CANCELED'])),
      },
      relations: ['comics', 'comics.genres'],
    });
  }

  async findJoinedAuctionByUser(userId: string): Promise<Auction[]> {
    const userBids = await this.bidReposistory.find({
      where: {
        user: { id: userId },
      },
    });

    const auctions = await Promise.all(
      userBids.map(async (bid) => {
        return await this.auctionRepository.findOne({
          where: { id: bid.auction.id },
          relations: ['comics', 'comics.genres'],
        });
      }),
    );

    // Loại bỏ các phần tử trùng lặp theo `id`
    const uniqueAuctions = auctions.filter(
      (value, index, array) =>
        index === array.findIndex((auction) => auction.id === value.id),
    );

    // Sắp xếp theo `updatedAt` giảm dần
    uniqueAuctions.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

    return uniqueAuctions;
  }

  async updateAuctionStatusToCompleted(
    id: string,
    user: User,
  ): Promise<Auction> {
    const auction = await this.auctionRepository.findOne({
      where: { id },
      relations: ['comics', 'bids', 'bids.user'],
    });
    if (!auction) {
      throw new NotFoundException(`Auction with ID ${id} not found`);
    }

    // Update auction status and winner
    auction.status = 'COMPLETED';
    auction.winner = user;
    auction.endTime = new Date();
    auction.isPaid = true;

    const updatedAuction = await this.auctionRepository.save(auction);

    const latestBid = auction.bids.reduce((highest, bid) =>
      bid.price > highest.price ? bid : highest,
    );
    this.eventsGateway.notifyUser(
      latestBid.user.id,
      `Xin chúc mừng! Bạn đã chiến thắng đấu giá ${auction.comics.title}.`,
      { auctionId: updatedAuction },
      'Kết quả đấu giá',
      AnnouncementType.AUCTION,
      RecipientType.USER,
      'SUCCESSFUL',
    );
    this.eventsGateway.notifyUser(
      auction.comics.sellerId.id,
      `Buổi đấu giá ${auction.comics.title} đã diễn ra thành công.`,
      { auctionId: updatedAuction },
      'Đấu giá',
      AnnouncementType.AUCTION,
      RecipientType.SELLER,
    );
    const losingUserIds = Array.from(
      new Set(
        auction.bids
          .filter((bid) => bid.user.id !== latestBid.user.id)
          .map((bid) => bid.user.id),
      ),
    );
    await this.eventsGateway.notifyUsers(
      losingUserIds,
      `Bạn đã đấu giá ${auction.comics.title} thất bại. Tiền cọc ${auction.depositAmount.toLocaleString('vi-VN')} đã được hoàn trả.`,
      { id: updatedAuction },
      'Kết quả đấu giá',
      AnnouncementType.AUCTION,
      'FAILED',
      RecipientType.USER,
    );
    await this.depositsService.refundAllDepositsExceptWinner(
      auction.id,
      latestBid.user.id,
    );

    return updatedAuction;
  }

  async startAuctionsThatShouldBeginNow(): Promise<{
    success: boolean;
    startedAuctions: string[];
    errors?: any[];
  }> {
    const now = new Date();
    const startedAuctionIds: string[] = [];
    const errors: any[] = [];

    const auctionsToStart = await this.auctionRepository.find({
      where: {
        startTime: LessThanOrEqual(now),
        status: 'UPCOMING',
      },
    });

    if (auctionsToStart.length > 0) {
      await Promise.all(
        auctionsToStart.map(async (auction) => {
          if (auction.startTime > now) {
            return;
          } else
            try {
              auction.status = 'ONGOING';
              await this.auctionRepository.save(auction);
              startedAuctionIds.push(auction.id);
              console.log(`Auction ${auction.id} started.`);
            } catch (error) {
              errors.push({ auctionId: auction.id, error });
            }
        }),
      );
    }

    return {
      success: errors.length === 0,
      startedAuctions: startedAuctionIds,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  async findUpcomingAuctions(): Promise<Auction[]> {
    const now = new Date();
    return this.auctionRepository.find({
      where: {
        startTime: MoreThan(now),
      },
    });
  }
  // Update an existing auction
  async updateAuction(id: string, data: UpdateAuctionDto): Promise<Auction> {
    await this.auctionRepository.update(id, data);
    return this.findAuctionById(id); // Return the updated auction
  }

  // Delete an auction
  async deleteAuction(id: string): Promise<void> {
    const result = await this.auctionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Auction with ID ${id} not found`);
    }
  }

  async cancelAuction(id: string): Promise<Auction> {
    const auction = await this.auctionRepository.findOne({ where: { id } });

    if (!auction) {
      throw new Error('Auction not found');
    }
    auction.status = 'CANCELED';
    return await this.auctionRepository.save(auction);
  }

  async checkPaidAuction() {
    try {
      const overdueAuctions = await this.auctionRepository.find({
        where: {
          status: 'SUCCESSFUL',
          isPaid: false,
          paymentDeadline: LessThanOrEqual(new Date()),
        },
        relations: ['comics', 'comics.sellerId', 'winner'],
      });

      if (!overdueAuctions.length) {
        console.log('No overdue auctions found.');
        return;
      }

      console.log(`${overdueAuctions.length} overdue auctions found.`);

      await Promise.all(
        overdueAuctions.map(async (auction) => {
          auction.comics.status = ComicsStatusEnum.UNAVAILABLE;
          auction.comics.type = ComicsTypeEnum.NONE;
          console.log('z', auction.comics.status);

          auction.status = 'FAILED';
          auction.currentCondition = `Người dùng ${auction.winner.name} không thanh toán đúng hẹn`;
          // Seize the deposit from the winner
          if (auction.winner) {
            const winnerDeposit =
              await this.depositsService.getUserDepositOfAnAuction(
                auction.winner.id,
                auction.id,
              );

            if (winnerDeposit) {
              await this.depositsService.seizeADepositAuction(winnerDeposit.id);
            }
            this.eventsGateway.notifyUser(
              auction.comics.sellerId.id,
              `Tiền cọc ${auction.depositAmount.toLocaleString('vi-VN')}đ đã được gửi về ví của bạn do người dùng ${auction.winner.name} không thanh toán đúng hẹn .`,
              { auctionId: auction },
              'Thông báo đấu giá',
              AnnouncementType.AUCTION,
              RecipientType.SELLER,
            );
          }

          // Save the updated auction status
          await this.auctionRepository.save(auction);
          await this.comicRepository.save(auction.comics);
        }),
      );

      console.log('All overdue auctions have been processed.');
    } catch (error) {
      console.error('Error handling overdue auctions:', error);
    }
  }

  // Other methods as needed
}
