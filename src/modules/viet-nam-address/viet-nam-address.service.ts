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
            provinceId: p.ProvinceID,
            provinceName,
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
            districtId: d.DistrictID,
            districtName: d.DistrictName,
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
        data.sort((a, b) => a.WardID - b.WardID);
        const filteredData = data.map((w) => {
          return {
            wardId: parseInt(w.WardCode),
            wardName: w.WardName,
          };
        });
        return filteredData;
      })
      .catch((err) => console.log(err));
  }
}
