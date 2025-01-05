import { Injectable } from '@nestjs/common';
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

@Injectable()
export class AuctionRequestService {
  constructor(
    @InjectRepository(AuctionRequest)
    private auctionRequestRepository: Repository<AuctionRequest>,
    @InjectRepository(Auction)
    private auctionRepository: Repository<Auction>,
    @InjectRepository(Comic)
    private comicRepository: Repository<Comic>,
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
    comic.type = ComicsTypeEnum.AUCTION;
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
    return this.auctionRequestRepository.find();
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

  // Approve and create a new auction if the request is approved
  async approveAuctionRequest(
    id: string,
    startTime: Date,
    endTime: Date,
  ): Promise<Auction> {
    const auctionRequest = await this.auctionRequestRepository.findOne({
      where: { id },
      relations: ['auction'], // Ensure related entities are fetched
    });

    if (!auctionRequest) {
      throw new Error('Auction Request not found');
    }
    if (auctionRequest.status === 'REJECTED') {
      throw new Error('Auction Request was rejected and cannot be approved');
    }
    if (auctionRequest.status !== 'APPROVED') {
      auctionRequest.status = 'APPROVED';
      auctionRequest.approvalDate = new Date();
      await this.auctionRequestRepository.save(auctionRequest);
    }

    if (!startTime || !endTime || endTime <= startTime) {
      throw new Error('Invalid start time or end time');
    }

    let auction: Auction;

    if (auctionRequest.auction) {
      auction = auctionRequest.auction;

      if (auction.status !== 'FAILED') {
        throw new Error('The linked auction is not eligible for reopening');
      }

      // Update auction details

      auction.startTime = startTime;
      auction.endTime = endTime;
      auction.currentPrice = auctionRequest.reservePrice;
      auction.status = 'UPCOMING';
    } else {
      // Create a new auction
      auction = this.auctionRepository.create({
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

      // Save and link the auction to the request
      auction = await this.auctionRepository.save(auction);
      auctionRequest.auction = auction; // Link auction to request
    }

    await this.auctionRequestRepository.save(auctionRequest);

    return auction;
  }
}
