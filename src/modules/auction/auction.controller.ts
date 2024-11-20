import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  Req,
  Patch,
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
  @Get()
  async findAll(): Promise<Auction[]> {
    return this.auctionService.findAllAuctions();
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
  @Get('upcoming')
  async getUpcomingAuctions(): Promise<Auction[]> {
    return this.auctionService.findUpcomingAuctions();
  }

  @Roles(Role.SELLER)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Get('seller')
  findAuctionBySeller(@Req() req: any): Promise<Auction[]> {
    return this.auctionService.findAuctionBySeller(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/joined')
  findJoinedAuctionByUser(@Req() req: any): Promise<Auction[]> {
    return this.auctionService.findJoinedAuctionByUser(req.user.id);
  }
  // Get a single auction by ID
  @UseGuards(JwtAuthGuard)
  @Patch(':id/status/completed')
  async updateStatusToCompleted(
    @Param('id') id: string,
    @Body('currentPrice') currentPrice: number,
    @Req() req: any,
  ): Promise<Auction> {
    const user = req.user; // Get the ID of the authenticated user
    return this.auctionService.updateAuctionStatusToCompleted(
      id,
      currentPrice,
      user,
    );
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

  // Delete an auction
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.auctionService.deleteAuction(id);
  }
}
