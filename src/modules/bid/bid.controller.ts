import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BidService } from './bid.service';
import { CreateBidDto, UpdateBidDto } from './dto/bid.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
@ApiTags('bids')
@Controller('bids')
export class BidController {
  constructor(private readonly bidService: BidService) {}

  @Post()
  create(@Body() createBidDto: CreateBidDto) {
    return this.bidService.create(createBidDto);
  }

  @Get()
  findAll() {
    return this.bidService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bidService.findOne(id);
  }
  @Get('auction/:auctionId')
  async findAllByAuction(@Param('auctionId') auctionId: string) {
    return this.bidService.findAllByAuction(auctionId);
  }
  @UseGuards(JwtAuthGuard)
  @Get('highest-bid/:auctionId')
  async findHighestBidOfUserByAuction(
    @Param('auctionId') auctionId: string,
    @Req() req: any,
  ) {
    return this.bidService.findHighestBidOfUserByAuction(
      auctionId,
      req.user.id,
    );
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBidDto: UpdateBidDto) {
    return this.bidService.update(id, updateBidDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bidService.remove(id);
  }
}
