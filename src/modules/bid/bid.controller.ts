import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { BidService } from './bid.service';
import { CreateBidDto, UpdateBidDto } from './dto/bid.dto';
import { ApiTags } from '@nestjs/swagger';
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBidDto: UpdateBidDto) {
    return this.bidService.update(id, updateBidDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bidService.remove(id);
  }
}
