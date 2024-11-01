import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { VietNamAddressService } from './viet-nam-address.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';

@ApiBearerAuth()
@ApiTags('VietNam Address')
@Controller('viet-nam-address')
export class VietNamAddressController {
  constructor(private readonly vietNamAddressService: VietNamAddressService) {}

  @UseGuards(JwtAuthGuard)
  @Get('provinces')
  getAllProvinces() {
    return this.vietNamAddressService.getProvinces();
  }

  @UseGuards(JwtAuthGuard)
  @Get('districts/:province_id')
  getAllProvincesAndDistricts(@Param('province_id') province_id: string) {
    return this.vietNamAddressService.getDistrictsByProvinceCode(province_id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('wards/:district_code')
  getWardsByCodes(@Param('district_code') districtCode: string) {
    return this.vietNamAddressService.getWardsByCodes(districtCode);
  }
}
