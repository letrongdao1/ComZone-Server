import {
  Controller,
  // Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  Req,
  Patch,
  Post,
} from '@nestjs/common';
import { AuctionService } from './auction.service';
import { Auction } from '../../entities/auction.entity';
import { CreateAuctionDto, UpdateAuctionDto } from './dto/auction.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Roles } from '../authorization/roles.decorator';
import { Role } from '../authorization/role.enum';
import { PermissionsGuard } from '../authorization/permission.guard';

@ApiBearerAuth()
@ApiTags('Auction')
@Controller('auction')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @Post()
  async create(@Body() createAuctionDto: CreateAuctionDto) {
    return this.auctionService.createAuction(createAuctionDto);
  }
  // @Post('request')
  // async createAuctionRequest(
  //   @Body() createAuctionDto: CreateAuctionDto,
  // ): Promise<Auction> {
  //   return await this.auctionService.createAuctionRequest(createAuctionDto);
  // }

  @Get()
  async findAll(): Promise<Auction[]> {
    return this.auctionService.findAllAuctions();
  }

  @Get('comics/:comics_id')
  getByComicsId(@Param('comics_id') comicsId: string) {
    return this.auctionService.getByComicsId(comicsId);
  }
  @Put(':id/approve')
  async approveAuctionRequest(
    @Param('id') id: string,
    @Body() updateAuctionDto: UpdateAuctionDto, // Bind the body using DTO
  ): Promise<Auction> {
    // Ensure `startTime` and `duration` exist in the DTO

    return await this.auctionService.approveAuctionRequest(
      id,
      updateAuctionDto,
    );
  }

  @Get('check-ended-auctions')
  async checkEndedAuctions() {
    try {
      return await this.auctionService.checkAndDeclareWinnersForEndedAuctions();
    } catch (error) {
      return { message: 'Failed to check for ended auctions', error };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('exclude-user')
  async getAuctionsExcludingUser(@Req() req: any): Promise<Auction[]> {
    const sellerId = req.user ? req.user.id : null;
    return this.auctionService.findAuctionsExcludingUser(sellerId);
  }

  @Get('declare-winner/:id')
  async declareWinner(@Param('id') id: string) {
    return this.auctionService.declareWinner(id);
  }

  @Get('upcoming/limit/:limit')
  async getUpcomingAuctions(@Param('limit') limit: string): Promise<Auction[]> {
    return this.auctionService.getUpcomingAuctionsWithLimit(Number(limit));
  }

  @Get('ongoing')
  async getOngoingAuctions(): Promise<Auction[]> {
    return this.auctionService.getOngoingAuctions();
  }

  @Get('upcoming/123')
  async startAuction(): Promise<{
    success: boolean;
    startedAuctions: string[];
  }> {
    return await this.auctionService.startAuctionsThatShouldBeginNow();
  }

  @Roles(Role.SELLER)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Get('seller')
  findAuctionBySeller(@Req() req: any): Promise<Auction[]> {
    return this.auctionService.findAuctionBySeller(req.user.id);
  }

  @Get('active/seller/:id')
  getActiveAuctionsBySeller(@Param('id') sellerId: string): Promise<Auction[]> {
    return this.auctionService.getActiveAuctionsBySeller(sellerId);
  }
  @Get('most-bids')
  async findAuctionWithMostBids(): Promise<Auction[]> {
    const auctions = await this.auctionService.findAuctionWithMostBids();
    return auctions;
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/joined')
  findJoinedAuctionByUser(@Req() req: any): Promise<Auction[]> {
    return this.auctionService.findJoinedAuctionByUser(req.user.id);
  }
  // Get a single auction by ID
  // @UseGuards(JwtAuthGuard)
  // @Patch(':id/status/completed')
  // async updateStatusToCompleted(
  //   @Param('id') id: string,
  //   @Body('currentPrice') currentPrice: number,
  //   @Req() req: any,
  // ): Promise<Auction> {
  //   const user = req.user; // Get the ID of the authenticated user
  //   return this.auctionService.updateAuctionStatusToCompleted(
  //     id,
  //     currentPrice,
  //     user,
  //   );
  // }
  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  async cancelAuction(@Param('id') id: string): Promise<Auction> {
    return this.auctionService.cancelAuction(id);
  }

  @Patch(':id/stop-auction')
  async stopAuctioning(@Param('id') id: string): Promise<Auction> {
    console.log('1', id);

    return this.auctionService.stopAuctioning(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Auction> {
    return this.auctionService.findAuctionById(id);
  }

  // Update an existing auction
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateAuctionDto,
  ): Promise<Auction> {
    return this.auctionService.updateAuction(id, data);
  }
  @Put(':id/start')
  async updateAuctionToStart(
    @Param('id') id: string,
    @Body() data: UpdateAuctionDto,
  ): Promise<Auction> {
    return this.auctionService.updateAuctionToStart(id, data);
  }

  @Patch('endtime/now/:auction_id')
  adjustEndTimeToBeSooner(@Param('auction_id') auctionId: string) {
    return this.auctionService.adjustEndTimeToBeSooner(auctionId);
  }

  @Patch('payment-deadline/now/:auction_id')
  adjustPaymentDeadlineToBeSooner(@Param('auction_id') auctionId: string) {
    return this.auctionService.adjustPaymentDeadlineToBeSooner(auctionId);
  }

  // Delete an auction
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.auctionService.deleteAuction(id);
  }
}
