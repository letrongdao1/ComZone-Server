import { Module } from '@nestjs/common';
import { SellerDetailsService } from './seller-details.service';
import { SellerDetailsController } from './seller-details.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerDetails } from 'src/entities/seller-details.entity';
import { UsersModule } from '../users/users.module';
import { VietNamAddressModule } from '../viet-nam-address/viet-nam-address.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SellerDetails]),
    UsersModule,
    VietNamAddressModule,
  ],
  controllers: [SellerDetailsController],
  providers: [SellerDetailsService],
  exports: [SellerDetailsService],
})
export class SellerDetailsModule {}
