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

@Injectable()
export class AuctionService {
  constructor(
    @InjectRepository(Auction)
    private auctionRepository: Repository<Auction>,
    @InjectRepository(Comic)
    private comicRepository: Repository<Comic>,
    @InjectRepository(Bid) private bidReposistory: Repository<Bid>,
    @InjectRepository(Announcement)
    private annoucementRepository: Repository<Announcement>,
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

    if (existingAuction) {
      throw new ConflictException(
        `An auction already exists for Comic ID ${data.comicsId}`,
      );
    }

    // Change the comic's status to AUCTION
    comic.status = ComicsStatusEnum.AUCTION;
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

    // Find auctions that have ended and are still marked as "ONGOING"
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
      return;
    }
    console.log('auction1111', auction);
    const latestBid = auction.bids.reduce((highest, bid) =>
      bid.price > highest.price ? bid : highest,
    );

    if (latestBid) {
      auction.status = 'PROCESSING';
      auction.winner = latestBid.user;
      await this.auctionRepository.save(auction);

      // Notify the winner
      // Notify the winning bidder
      this.eventsGateway.notifyUser(
        latestBid.user.id, // Winning bidder's user ID
        `Congratulations! You won the auction for ${auction.comics.title}.`, // Message
        auction.id, // Auction ID
        'Chúc mừng', // Title
      );

      // Notify the losing bidders
      auction.bids
        .filter((bid) => bid.user.id !== latestBid.user.id) // Filter out the winning bid
        .forEach((bid) => {
          this.eventsGateway.notifyUser(
            bid.user.id, // Losing bidder's user ID
            'Cuộc đấu giá đã kết thúc. Rất tiếc bạn đã không chiến thắng.', // Message
            auction.id, // Auction ID
            'Kết quả đấu giá', // Title for losing bidder (you can customize this)
          );
        });
    } else {
      auction.status = 'FAILED';
      await this.auctionRepository.save(auction);

      // Notify all users in the auction that no bids were placed
      // this.eventsGateway.broadcastNotification(
      //   `Auction for ${auction.comics.title} ended with no bids.`,
      // );
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
