import { Module } from '@nestjs/common';
import { SellerDetailsService } from './seller-details.service';
import { SellerDetailsController } from './seller-details.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerDetails } from 'src/entities/seller-details.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([SellerDetails]), UsersModule],
  controllers: [SellerDetailsController],
  providers: [SellerDetailsService],
})
export class SellerDetailsModule {}
