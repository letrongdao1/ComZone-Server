import { Injectable, NotFoundException } from '@nestjs/common';
import data from './address-data.json';
@Injectable()
export class VietNamAddressService {
  getProvinces() {
    return data.map((address) => {
      return {
        province: address.name,
        code: address.code,
      };
    });
  }

  getDistrictsByProvinceCode(code: string) {
    const province = data.find((address) => address.code === parseInt(code));
    if (!province)
      throw new NotFoundException('Province code cannot be found!');

    return province.districts.map((district) => {
      return {
        district: district.name,
        code: district.code,
      };
    });
  }

  getWardsByCodes(districtCode: string) {
    const provinceWithDistrictCode = data.find((address) =>
      address.districts.find(
        (district) => district.code === parseInt(districtCode),
      ),
    );

    if (!provinceWithDistrictCode)
      throw new NotFoundException('District code cannot be found!');

    const district = provinceWithDistrictCode.districts.find(
      (district) => district.code === parseInt(districtCode),
    );

    return district.wards.map((ward) => {
      return {
        ward: ward.name,
        code: ward.code,
      };
    });
  }
}
