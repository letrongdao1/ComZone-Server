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

@Injectable()
export class AuctionService {
  constructor(
    @InjectRepository(Auction)
    private auctionRepository: Repository<Auction>,
    @InjectRepository(Comic)
    private comicRepository: Repository<Comic>,
    @InjectRepository(Bid) private bidRepository: Repository<Bid>,
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
      relations: ['bids'],
    });

    // Use Promise.all to handle each ended auction concurrently
    await Promise.all(
      endedAuctions.map(async (auction) => {
        await this.declareWinner(auction.id);
      }),
    );
  }

  // Hàm xác định người chiến thắng cho một phiên đấu giá
  async declareWinner(
    auctionId: string,
  ): Promise<{ winner: string; bid: number } | string> {
    const auction = await this.auctionRepository.findOne({
      where: { id: auctionId },
      relations: ['bids'],
    });
    if (!auction) throw new NotFoundException('Auction not found');
    // Kiểm tra nếu phiên đấu giá đã kết thúc
    const now = new Date();
    if (auction.endTime > now) {
      return 'Auction is still ongoing';
    }

    // Lấy giá thầu cao nhất cho phiên đấu giá
    const latestBid = await this.bidRepository.findOne({
      where: { auction: { id: auction.id } },
      order: { createdAt: 'ASC' },
    });
    console.log('11', latestBid);
    if (latestBid) {
      auction.status = 'PROCESSING';
      auction.winner = latestBid.user;
      await this.auctionRepository.save(auction);
      return { winner: latestBid.user.id, bid: latestBid.price };
    } else {
      auction.status = 'FAILED';
      await this.auctionRepository.save(auction);
      return 'No bids were placed; auction failed';
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
    const userBids = await this.bidRepository.find({
      where: {
        user: { id: userId },
      },
    });

    const auctions = await Promise.all(
      userBids.map(async (bid) => {
        return await this.auctionRepository.findOne({
          where: { id: bid.auction.id },
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
