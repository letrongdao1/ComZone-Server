import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThan, Not, Repository } from 'typeorm';
import { Auction } from '../../entities/auction.entity';
import { CreateAuctionDto, UpdateAuctionDto } from './dto/auction.dto';
import { Comic } from 'src/entities/comics.entity';
import { ComicsStatusEnum } from '../comics/dto/comic-status.enum';
import { Bid } from 'src/entities/bid.entity';
import { Announcement } from 'src/entities/announcement.entity';
import { AnnouncementService } from '../announcement/announcement.service';
import { EventsGateway } from '../socket/event.gateway';
import { User } from 'src/entities/users.entity';
import { ComicsTypeEnum } from '../comics/dto/comic-type.enum';

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
    private readonly eventsGateway: EventsGateway,
  ) {}

  async createAuction(data: CreateAuctionDto): Promise<Auction> {
    // Retrieve the comic
    const comic = await this.comicRepository.findOne({
      where: { id: data.comicsId },
    });

    if (!comic) {
      throw new NotFoundException(`Comic with ID ${data.comicsId} not found`);
    }

    // Check if an auction already exists for this comic
    const existingAuction = await this.auctionRepository.findOne({
      where: { comics: { id: comic.id } },
    });
    console.log('zzz', existingAuction);

    if (existingAuction) {
      throw new ConflictException(
        `An auction already exists for Comic ID ${data.comicsId}`,
      );
    }

    // Change the comic's status to AUCTION
    comic.status = 'AVAILABLE';
    comic.type = ComicsTypeEnum.AUCTION;
    await this.comicRepository.save(comic); // Save the updated status

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

      auction.status = 'PROCESSING';
      auction.winner = latestBid.user;
      await this.auctionRepository.save(auction);

      // Notify the winning bidder in real-time
      this.eventsGateway.notifyUser(
        latestBid.user.id,
        `Xin chúc mừng! Bạn đã chiến thắng đấu giá ${auction.comics.title}.`,
        auction.id,
        'Chúc mừng',
        'AUCTION',
        'SUCCESSFUL',
      );

      // Collect all losing bidders' userIds
      const losingUserIds = Array.from(
        new Set(
          auction.bids
            .filter((bid) => bid.user.id !== latestBid.user.id)
            .map((bid) => bid.user.id),
        ),
      );

      // Create Announcements for Losing Bidders and Notify Them
      await this.eventsGateway.notifyUsers(
        losingUserIds,
        `Buổi đấu giá đã kết thúc. Thật tiếc bạn đã không thắng lần này.`,
        auction.id,
        'Kết quả đấu giá',
        'AUCTION',
        'FAILED',
      );
    } else {
      // No bids, so the auction failed
      auction.status = 'FAILED';
      await this.auctionRepository.save(auction);

      // Optionally create an Announcement for all users if the auction failed
      const failedAnnouncement = new Announcement();
      failedAnnouncement.title = `Auction for ${auction.comics.title} failed.`;
      failedAnnouncement.message = `The auction for ${auction.comics.title} ended without any bids.`;
      await this.announcementRepository.save(failedAnnouncement);
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

    return auctions.filter(
      (value, index, array) =>
        index === array.findIndex((auction) => auction.id === value.id),
    );
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

  // Other methods as needed
}
