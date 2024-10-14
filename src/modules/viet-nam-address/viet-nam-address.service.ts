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

    return province.districts;
  }

  getWardsByCodes(provinceCode: string, districtCode: string) {
    const province = data.find(
      (address) => (address.code = parseInt(provinceCode)),
    );

    if (!province)
      throw new NotFoundException('Province code cannot be found!');

    const district = province.districts.find(
      (dist) => dist.code === parseInt(districtCode),
    );

    if (!district)
      throw new NotFoundException('District code cannot be found!');

    return district.wards;
  }
}
