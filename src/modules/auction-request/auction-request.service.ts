import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import {
  CreateAuctionRequestDto,
  UpdateAuctionRequestDto,
} from './dto/auction-request.dto';

import { Comic } from 'src/entities/comics.entity';
import { AuctionRequest } from 'src/entities/auction-request.entity';
import { Auction } from 'src/entities/auction.entity';
import { ComicsStatusEnum } from '../comics/dto/comic-status.enum';
import { ComicsTypeEnum } from '../comics/dto/comic-type.enum';
import { EventsGateway } from '../socket/event.gateway';
import {
  AnnouncementType,
  RecipientType,
} from 'src/entities/announcement.entity';

@Injectable()
export class AuctionRequestService {
  constructor(
    @InjectRepository(AuctionRequest)
    private auctionRequestRepository: Repository<AuctionRequest>,
    @InjectRepository(Auction)
    private auctionRepository: Repository<Auction>,
    @InjectRepository(Comic)
    private comicRepository: Repository<Comic>,
    @Inject(EventsGateway) // Correctly inject the gateway
    private readonly eventsGateway: EventsGateway,
  ) {}

  // Create a new auction request
  async create(createDto: CreateAuctionRequestDto): Promise<AuctionRequest> {
    console.log('123');

    const comic = await this.comicRepository.findOne({
      where: { id: createDto.comicId },
    });
    if (!comic) {
      throw new Error('Comic not found');
    }
    comic.status = ComicsStatusEnum.AVAILABLE;
    comic.type = ComicsTypeEnum.AUCTION_REQUEST;
    // comic.onSaleSince = new Date(Date.now());
    await this.comicRepository.save(comic);
    const auctionRequest = this.auctionRequestRepository.create({
      comic,
      reservePrice: createDto.reservePrice,
      maxPrice: createDto.maxPrice,
      priceStep: createDto.priceStep,
      depositAmount: createDto.depositAmount,
      duration: createDto.duration,
      status: createDto.status,
    });

    return this.auctionRequestRepository.save(auctionRequest);
  }

  // Get all auction requests
  async findAll(): Promise<AuctionRequest[]> {
    return this.auctionRequestRepository.find({
      order: {
        updatedAt: 'DESC', // Order by updatedAt in descending order
      },
    });
  }

  // Get one auction request by ID
  async findOne(id: string): Promise<AuctionRequest> {
    return this.auctionRequestRepository.findOne({ where: { id } });
  }

  // Update an auction request status
  async update(
    id: string,
    updateDto: UpdateAuctionRequestDto,
  ): Promise<AuctionRequest> {
    const auctionRequest = await this.auctionRequestRepository.findOne({
      where: { id },
    });

    if (!auctionRequest) {
      throw new Error('Auction Request not found');
    }

    if (updateDto.status) {
      auctionRequest.status = updateDto.status;
    }

    if (updateDto.rejectionReason) {
      auctionRequest.rejectionReason = updateDto.rejectionReason;
    }

    return this.auctionRequestRepository.save(auctionRequest);
  }
  // Get all auction requests by a specific seller
  async findBySellerId(sellerId: string): Promise<AuctionRequest[]> {
    return this.auctionRequestRepository.find({
      where: {
        comic: {
          sellerId: { id: sellerId },
        },
      },
      relations: ['comic', 'comic.sellerId'], // Ensure we load related seller and comic data
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  // Approve and create a new auction if the request is approved
  async approveAuctionRequest(
    id: string,
    startTime: Date,
    endTime: Date,
  ): Promise<Auction> {
    // Fetch the auction request along with related comic entity
    const auctionRequest = await this.auctionRequestRepository.findOne({
      where: { id },
      relations: ['comic', 'comic.sellerId'],
    });

    if (!auctionRequest) {
      throw new Error('Auction Request not found');
    }

    if (auctionRequest.status === 'REJECTED') {
      throw new Error('Auction Request was rejected and cannot be approved');
    }

    if (!startTime || !endTime || endTime <= startTime) {
      throw new Error('Invalid start time or end time');
    }

    let auction = await this.auctionRepository.findOne({
      where: { comics: { id: auctionRequest.comic.id } },
    });

    if (auction) {
      if (auction.status === 'STOPPED') {
        // Reopen the existing auction
        auction.startTime = startTime;
        auction.endTime = endTime;
        auction.currentPrice = auctionRequest.reservePrice;
        auction.maxPrice = auctionRequest.maxPrice;
        auction.priceStep = auctionRequest.priceStep;
        auction.depositAmount = auctionRequest.depositAmount;
        auction.reservePrice = auctionRequest.reservePrice;
        auction.status = 'UPCOMING';

        await this.auctionRepository.save(auction);

        // Notify seller about reopening
        this.eventsGateway.notifyUser(
          auctionRequest.comic.sellerId.id,
          `Phiên đấu giá "${auctionRequest.comic.title}" đã được mở lại.`,
          { auctionId: auction },
          'Cập nhật phiên đấu giá',
          AnnouncementType.AUCTION,
          RecipientType.SELLER,
        );
      } else {
        // Create a new auction since the current one is not eligible for reopening
        auction = await this.createNewAuction(
          auctionRequest,
          startTime,
          endTime,
        );
      }
    } else {
      // Create a new auction if none exists
      auction = await this.createNewAuction(auctionRequest, startTime, endTime);
    }

    // Update auction request status
    auctionRequest.status = 'APPROVED';
    auctionRequest.approvalDate = new Date();
    auctionRequest.auction = auction;
    await this.auctionRequestRepository.save(auctionRequest);

    // Update the `onSaleSince` property of the comic
    auctionRequest.comic.type = ComicsTypeEnum.AUCTION;
    auctionRequest.comic.onSaleSince = new Date();
    await this.comicRepository.save(auctionRequest.comic);

    return auction;
  }

  // Helper function to create a new auction
  private async createNewAuction(
    auctionRequest: AuctionRequest,
    startTime: Date,
    endTime: Date,
  ): Promise<Auction> {
    const auction = this.auctionRepository.create({
      comics: auctionRequest.comic,
      maxPrice: auctionRequest.maxPrice,
      priceStep: auctionRequest.priceStep,
      depositAmount: auctionRequest.depositAmount,
      reservePrice: auctionRequest.reservePrice,
      currentPrice: auctionRequest.reservePrice,
      startTime,
      endTime,
      status: 'UPCOMING',
    });

    const savedAuction = await this.auctionRepository.save(auction);

    // Notify seller about the new auction
    this.eventsGateway.notifyUser(
      auctionRequest.comic.sellerId.id,
      `Yêu cầu duyệt đấu giá ${auctionRequest.comic.title} đã được chấp thuận.`,
      { auctionRequestId: auctionRequest },
      'Yêu cầu đấu giá',
      AnnouncementType.AUCTION_REQUEST,
      RecipientType.SELLER,
    );

    return savedAuction;
  }

  async rejectAuctionRequest(
    id: string,
    rejectionReasons: string[],
  ): Promise<AuctionRequest> {
    const auctionRequest = await this.auctionRequestRepository.findOne({
      where: { id },
      relations: ['comic'],
    });

    if (!auctionRequest) {
      throw new Error('Auction Request not found');
    }

    // Update comic status and type
    auctionRequest.comic.status = ComicsStatusEnum.UNAVAILABLE;
    auctionRequest.comic.type = ComicsTypeEnum.NONE;
    await this.comicRepository.save(auctionRequest.comic);

    // Update auction request status and rejection reasons
    auctionRequest.status = 'REJECTED';
    auctionRequest.rejectionReason = rejectionReasons;

    const savedAuctionRequest =
      await this.auctionRequestRepository.save(auctionRequest);

    // Optionally, notify the seller about the rejection
    this.eventsGateway.notifyUser(
      savedAuctionRequest.comic.sellerId.id,
      `Yêu cầu duyệt đấu giá ${savedAuctionRequest.comic.title} đã bị từ chối. Lý do: ${rejectionReasons.join(
        ' ',
      )}`,
      { auctionRequestId: savedAuctionRequest },
      'Yêu cầu đấu giá',
      AnnouncementType.AUCTION_REQUEST_FAIL,
      RecipientType.SELLER,
    );

    return savedAuctionRequest;
  }
}
