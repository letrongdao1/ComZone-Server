import { Module } from '@nestjs/common';
import { AuctionCriteriaService } from './auction-criteria.service';
import { AuctionCriteriaController } from './auction-criteria.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionCriteria } from 'src/entities/auction-criteria.entity';
import { EditionsModule } from '../editions/editions.module';

@Module({
  imports: [TypeOrmModule.forFeature([AuctionCriteria]), EditionsModule],
  controllers: [AuctionCriteriaController],
  providers: [AuctionCriteriaService],
  exports: [AuctionCriteriaService],
})
export class AuctionCriteriaModule {}
