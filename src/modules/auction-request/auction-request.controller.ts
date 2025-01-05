import { Controller, Post, Body, Get, Param, Put, Patch } from '@nestjs/common';
import { AuctionRequestService } from './auction-request.service';
import {
  ApproveAuctionRequestDto,
  CreateAuctionRequestDto,
  UpdateAuctionRequestDto,
} from './dto/auction-request.dto';
import { AuctionRequest } from 'src/entities/auction-request.entity';

@Controller('auction-request')
export class AuctionRequestController {
  constructor(private readonly auctionRequestService: AuctionRequestService) {}

  // Create a new auction request
  @Post()
  async create(
    @Body() createDto: CreateAuctionRequestDto,
  ): Promise<AuctionRequest> {
    return this.auctionRequestService.create(createDto);
  }

  // Get all auction requests
  @Get()
  async findAll(): Promise<AuctionRequest[]> {
    return this.auctionRequestService.findAll();
  }

  // Get auction request by ID
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<AuctionRequest> {
    return this.auctionRequestService.findOne(id);
  }

  // Update an auction request (approve, reject, etc.)
  @Put(':id/approve')
  async approve(
    @Param('id') id: string,
    @Body() approveDto: ApproveAuctionRequestDto,
  ): Promise<any> {
    const { startTime, endTime } = approveDto;
    return this.auctionRequestService.approveAuctionRequest(
      id,
      startTime,
      endTime,
    );
  }
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAuctionRequestDto,
  ): Promise<AuctionRequest> {
    return this.auctionRequestService.update(id, updateDto);
  }
  @Patch(':id/reject')
  async rejectAuctionRequest(
    @Param('id') id: string,
    @Body() body: { rejectionReason: string },
  ) {
    return this.auctionRequestService.rejectAuctionRequest(
      id,
      body.rejectionReason,
    );
  }

  // Approve an auction request and create a new auction
}
