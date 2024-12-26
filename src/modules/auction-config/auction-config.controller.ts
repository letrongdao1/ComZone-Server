import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { AuctionConfigService } from './auction-config.service';
import {
  CreateAuctionConfigDto,
  UpdateAuctionConfigDto,
} from './dto/auction-config.dto';

@Controller('auction-config')
export class AuctionConfigController {
  constructor(private readonly auctionConfigService: AuctionConfigService) {}

  @Post()
  async createConfig(@Body() createAuctionConfigDto: CreateAuctionConfigDto) {
    return await this.auctionConfigService.createConfig(createAuctionConfigDto);
  }

  @Get()
  async getConfig() {
    return await this.auctionConfigService.getConfig();
  }

  @Put(':id') // :id will be the identifier for the AuctionConfig
  async updateConfig(
    @Param('id') auctionConfigId: string, // Get the id from the URL parameter
    @Body() updateAuctionConfigDto: UpdateAuctionConfigDto,
  ) {
    return await this.auctionConfigService.updateConfig(
      auctionConfigId,
      updateAuctionConfigDto,
    );
  }
}
