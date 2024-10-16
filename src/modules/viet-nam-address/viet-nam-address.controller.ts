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
  @Get('districts/:province_code')
  getAllProvincesAndDistricts(@Param('province_code') province_code: string) {
    return this.vietNamAddressService.getDistrictsByProvinceCode(province_code);
  }

  @UseGuards(JwtAuthGuard)
  @Get('wards/:province_code/:district_code')
  getWardsByCodes(
    @Param('province_code') provinceCode: string,
    @Param('district_code') districtCode: string,
  ) {
    return this.vietNamAddressService.getWardsByCodes(
      provinceCode,
      districtCode,
    );
  }
}
