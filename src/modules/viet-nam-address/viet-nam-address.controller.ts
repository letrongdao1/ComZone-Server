import { Controller, Get, Param } from '@nestjs/common';
import { VietNamAddressService } from './viet-nam-address.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('VietNam Address')
@Controller('viet-nam-address')
export class VietNamAddressController {
  constructor(private readonly vietNamAddressService: VietNamAddressService) {}

  @Get('provinces')
  getAllProvinces() {
    return this.vietNamAddressService.getProvinces();
  }

  @Get('districts/:province_code')
  getAllProvincesAndDistricts(@Param('province_code') province_code: string) {
    return this.vietNamAddressService.getDistrictsByProvinceCode(province_code);
  }

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
