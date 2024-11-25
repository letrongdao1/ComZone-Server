import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from 'src/entities/bid.entity';
import { CreateBidDto, UpdateBidDto } from './dto/bid.dto';
import { Auction } from 'src/entities/auction.entity';
import { User } from 'src/entities/users.entity';

@Injectable()
export class BidService {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createBidDto: CreateBidDto): Promise<Bid> {
    const { userId, auctionId, price } = createBidDto;
    console.log('121312', createBidDto);

    // Check if the user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if the auction exists
    const auction = await this.auctionRepository.findOne({
      where: { id: auctionId },
    });
    if (!auction) {
      throw new NotFoundException(`Auction with ID ${auctionId} not found`);
    }
    console.log('AUCTION', auction);

    // Determine the minimum acceptable bid based on the current price or reserve price
    const minimumBid = auction.currentPrice
      ? auction.currentPrice + auction.priceStep
      : auction.reservePrice + auction.priceStep;

    if (price < minimumBid) {
      throw new Error(`The bid must be at least ${minimumBid}`);
    }

    // Create and save the new bid

    // Update the auction's current price
    auction.currentPrice = price;
    await this.auctionRepository.save(auction);

    const bid = this.bidRepository.create({ user, auction, price });
    await this.bidRepository.save(bid);
    return bid;
  }

  async findAll(): Promise<Bid[]> {
    return this.bidRepository.find({ relations: ['user', 'auction'] });
  }

  async findOne(id: string): Promise<Bid> {
    const bid = await this.bidRepository.findOne({
      where: { id },
      relations: ['user', 'auction'],
    });
    if (!bid) {
      throw new NotFoundException(`Bid with ID ${id} not found`);
    }
    return bid;
  }
  async findAllByAuction(auctionId: string): Promise<Bid[]> {
    const auction = await this.auctionRepository.findOne({
      where: { id: auctionId },
    });
    if (!auction) {
      throw new NotFoundException(`Auction with ID ${auctionId} not found`);
    }

    return this.bidRepository.find({
      where: { auction: { id: auctionId } },
      relations: ['user', 'auction'],
      order: { createdAt: 'DESC' }, // Optional: order bids by creation date
    });
  }
  async findHighestBidOfUserByAuction(
    auctionId: string,
    userId: string,
  ): Promise<Bid | null> {
    // Kiểm tra nếu auction tồn tại
    const auction = await this.auctionRepository.findOne({
      where: { id: auctionId },
    });
    if (!auction) {
      throw new NotFoundException(`Auction with ID ${auctionId} not found`);
    }

    // Tìm lượt đấu giá cao nhất của người dùng trong auction
    const highestBid = await this.bidRepository.findOne({
      where: { auction: { id: auctionId }, user: { id: userId } },
      relations: ['user', 'auction'],
      order: { createdAt: 'DESC' }, // Sắp xếp theo số tiền đấu giá (giảm dần)
    });

    return highestBid || null; // Nếu không có bid, trả về null
  }

  async update(id: string, updateBidDto: UpdateBidDto): Promise<Bid> {
    const bid = await this.findOne(id);
    Object.assign(bid, updateBidDto);
    return this.bidRepository.save(bid);
  }

  async remove(id: string): Promise<void> {
    const result = await this.bidRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Bid with ID ${id} not found`);
    }
  }
}
