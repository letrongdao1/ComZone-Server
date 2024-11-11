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
} from '@nestjs/common';
import { AuctionService } from './auction.service';
import { Auction } from '../../entities/auction.entity';
import { CreateAuctionDto, UpdateAuctionDto } from './dto/auction.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';

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
  @UseGuards(JwtAuthGuard)
  @Get('exclude-user')
  async getAuctionsExcludingUser(@Req() req: any): Promise<Auction[]> {
    const sellerId = req.user ? req.user.id : null;
    console.log('1', sellerId);
    return this.auctionService.findAuctionsExcludingUser(sellerId);
  }

  @Get('upcoming')
  async getUpcomingAuctions(): Promise<Auction[]> {
    return this.auctionService.findUpcomingAuctions();
  }
  // Get a single auction by ID
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
