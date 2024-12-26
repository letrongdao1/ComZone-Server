import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionConfigController } from './auction-config.controller';
import { AuctionConfigService } from './auction-config.service';
import { AuctionConfig } from 'src/entities/auction-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuctionConfig])],
  controllers: [AuctionConfigController],
  providers: [AuctionConfigService],
  exports: [AuctionConfigService],
})
export class AuctionConfigModule {}
