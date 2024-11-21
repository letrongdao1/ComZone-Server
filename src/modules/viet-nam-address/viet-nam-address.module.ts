import { Module } from '@nestjs/common';
import { VietNamAddressService } from './viet-nam-address.service';
import { VietNamAddressController } from './viet-nam-address.controller';

@Module({
  controllers: [VietNamAddressController],
  providers: [VietNamAddressService],
  exports: [VietNamAddressService],
})
export class VietNamAddressModule {}
