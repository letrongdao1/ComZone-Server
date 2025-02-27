import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { AuctionRequestService } from './auction-request.service';
import {
  ApproveAuctionRequestDto,
  CreateAuctionRequestDto,
  UpdateAuctionRequestDto,
} from './dto/auction-request.dto';
import { AuctionRequest } from 'src/entities/auction-request.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Auction-request')
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
  @Get('/seller/:sellerId')
  async getAuctionRequestsBySeller(@Param('sellerId') sellerId: string) {
    return this.auctionRequestService.findBySellerId(sellerId);
  }

  @Patch(':id/reject')
  async rejectAuctionRequest(
    @Param('id') id: string,
    @Body() body: { rejectionReason: string[] },
  ) {
    if (!Array.isArray(body.rejectionReason)) {
      throw new BadRequestException('Rejection reason must be an array.');
    }

    return this.auctionRequestService.rejectAuctionRequest(
      id,
      body.rejectionReason,
    );
  }

  // Approve an auction request and create a new auction
}
