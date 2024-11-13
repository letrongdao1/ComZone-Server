import { Injectable, NotFoundException } from '@nestjs/common';
import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

@Injectable()
export class VietNamAddressService {
  async getProvinces() {
    return await axios
      .get(
        'https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/province',
        {
          headers: {
            Token: process.env.GHN_TOKEN,
          },
        },
      )
      .then((res) => {
        const data: any[] = res.data.data;
        data.sort((a, b) => a.ProvinceID - b.ProvinceID);
        const filteredData = data.map((p) => {
          let provinceName = '';
          if (
            p.ProvinceID === 201 ||
            p.ProvinceID === 202 ||
            p.ProvinceID === 203 ||
            p.ProvinceID === 220 ||
            p.ProvinceID === 224
          )
            provinceName = p.NameExtension[4];
          else if (p.ProvinceID === 223) provinceName = p.NameExtension[2];
          else provinceName = p.NameExtension[1];
          return {
            id: p.ProvinceID,
            name: provinceName,
          };
        });

        return filteredData;
      })
      .catch((err) => console.log(err));
  }

  async getDistrictsByProvinceCode(province_id: string) {
    return await axios
      .post(
        'https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district',
        {
          province_id: parseInt(province_id),
        },
        {
          headers: {
            Token: process.env.GHN_TOKEN,
          },
        },
      )
      .then((res) => {
        const data: any[] = res.data.data;
        data.sort((a, b) => a.DistrictID - b.DistrictID);
        const filteredData = data.map((d) => {
          return {
            id: d.DistrictID,
            name: d.DistrictName,
          };
        });
        return filteredData;
      })
      .catch((err) => console.log(err));
  }

  async getWardsByCodes(district_id: string) {
    return await axios
      .post(
        'https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward',
        {
          district_id: parseInt(district_id),
        },
        {
          headers: {
            Token: process.env.GHN_TOKEN,
          },
        },
      )
      .then((res) => {
        const data: any[] = res.data.data;
        data.sort((a, b) => a.WardCode.localeCompare(b.WardCode));
        const filteredData = data.map((w) => {
          return {
            id: w.WardCode,
            name: w.WardName,
          };
        });
        return filteredData;
      })
      .catch((err) => console.log(err));
  }

  async getProvinceById(id: number) {
    const provinces = await this.getProvinces();
    if (!provinces) throw new NotFoundException();
    return provinces.find((province) => province.id === id);
  }

  async getDistrictById(provinceId: number, districtId: number) {
    const districts = await this.getDistrictsByProvinceCode(
      provinceId.toString(),
    );
    if (!districts) throw new NotFoundException();
    return districts.find((district) => district.id === districtId);
  }

  async getWardById(districtId: number, wardId: string) {
    const wards = await this.getWardsByCodes(districtId.toString());
    if (!wards) throw new NotFoundException();
    return wards.find((ward) => ward.id === wardId);
  }
}
