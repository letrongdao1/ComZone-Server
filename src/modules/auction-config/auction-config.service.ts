import { Injectable } from '@nestjs/common';
import {
  CreateAuctionConfigDto,
  UpdateAuctionConfigDto,
} from './dto/auction-config.dto';
import { Repository } from 'typeorm';
import { AuctionConfig } from 'src/entities/auction-config.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuctionConfigService {
  constructor(
    @InjectRepository(AuctionConfig)
    private auctionConfigRepository: Repository<AuctionConfig>,
  ) {}

  async createConfig(createAuctionConfigDto: CreateAuctionConfigDto) {
    const existingConfig = await this.auctionConfigRepository.find();
    if (existingConfig.length > 0) {
      throw new Error('Configuration already exists');
    }
    const newConfig = this.auctionConfigRepository.create(
      createAuctionConfigDto,
    );
    return await this.auctionConfigRepository.save(newConfig);
  }

  async getConfig() {
    // Kiểm tra bản ghi đầu tiên trong bảng (nếu có)
    const config = await this.auctionConfigRepository.find();
    if (!config) {
      throw new Error('Configuration not found');
    }
    return config;
  }

  async updateConfig(
    auctionConfigId: string,
    updateAuctionConfigDto: UpdateAuctionConfigDto,
  ) {
    const existingConfig = await this.auctionConfigRepository.findOne({
      where: { id: auctionConfigId },
    });
    if (!existingConfig) {
      throw new Error('Configuration not found');
    }

    const updatedConfig = {
      ...existingConfig,
      ...updateAuctionConfigDto,
    };

    return await this.auctionConfigRepository.save(updatedConfig);
  }
}
