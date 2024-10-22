import { Module } from '@nestjs/common';
import { SellerInformationService } from './seller-information.service';
import { SellerInformationController } from './seller-information.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerInformation } from 'src/entities/seller_information.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([SellerInformation]), UsersModule],
  controllers: [SellerInformationController],
  providers: [SellerInformationService],
})
export class SellerInformationModule {}
