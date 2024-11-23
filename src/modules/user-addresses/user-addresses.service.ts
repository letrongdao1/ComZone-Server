import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { Address } from 'src/entities/address.entity';
import { Not, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { UserAddressDTO } from './dto/user-address';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class UserAddressesService extends BaseService<Address> {
  constructor(
    @InjectRepository(Address)
    private readonly userAddressesRepository: Repository<Address>,
    private readonly usersService: UsersService,
  ) {
    super(userAddressesRepository);
  }

  async createNewAddress(userId: string, addressDto: UserAddressDTO) {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    const checkAddress = await this.userAddressesRepository.findOne({
      where: {
        ...addressDto,
        user: {
          id: userId,
        },
      },
    });

    if (checkAddress)
      throw new ConflictException('This address has already been added!');

    const userAddresses = await this.userAddressesRepository.find({
      where: { user: { id: userId } },
    });

    if (userAddresses.length === 3)
      throw new ForbiddenException(
        'This user reached the maximum of 3 addresses!',
      );

    if (addressDto.isDefault) {
      await this.userAddressesRepository.update(
        { user: { id: userId } },
        { isDefault: false },
      );
    }

    const newAddress = this.userAddressesRepository.create({
      ...addressDto,
      user,
      isDefault: addressDto.isDefault || userAddresses.length === 0,
      usedTime: 0,
    });

    return await this.userAddressesRepository.save(newAddress);
  }

  filterProvinceName(province: any): string {
    let provinceName = '';
    if (
      province.ProvinceID === 201 ||
      province.ProvinceID === 202 ||
      province.ProvinceID === 203 ||
      province.ProvinceID === 220 ||
      province.ProvinceID === 224
    )
      provinceName = province.NameExtension[4];
    else if (province.ProvinceID === 223)
      provinceName = province.NameExtension[2];
    else provinceName = province.NameExtension[1];
    return provinceName;
  }

  async getAllAddressesOfUser(userId: string) {
    const addressList = await this.userAddressesRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      order: {
        isDefault: 'DESC',
        usedTime: 'DESC',
      },
    });

    return await Promise.all(
      addressList.map(async (address) => {
        const addressDetails = await this.getAddressNamesOfUser(address.id);
        return {
          ...address,
          province: {
            id: addressDetails.province.id,
            name: addressDetails.province.name,
          },
          district: {
            id: addressDetails.district.id,
            name: addressDetails.district.name,
          },
          ward: {
            id: addressDetails.ward.id,
            name: addressDetails.ward.name,
          },
          fullAddress: addressDetails.fullAddress,
        };
      }),
    );
  }

  async getAddressNamesOfUser(addressId: string) {
    const userAddress = await this.userAddressesRepository.findOne({
      where: { id: addressId },
    });
    if (!userAddress)
      throw new NotFoundException('User address cannot be found!');

    const headers = {
      Token: process.env.GHN_TOKEN,
    };

    const province = await axios
      .get(
        'https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/province',
        {
          headers,
        },
      )
      .then((res) => {
        const data: any[] = res.data.data;
        return data.find((p) => p.ProvinceID === userAddress.province);
      })
      .catch((err) => console.log(err));

    const district = await axios
      .post(
        'https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district',
        {
          province_id: userAddress.province,
        },
        {
          headers,
        },
      )
      .then((res) => {
        const data: any[] = res.data.data;
        return data.find((p) => p.DistrictID === userAddress.district);
      })
      .catch((err) => console.log(err));

    const ward = await axios
      .post(
        'https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward',
        {
          district_id: userAddress.district,
        },
        {
          headers,
        },
      )
      .then((res) => {
        const data: any[] = res.data.data;
        return data.find((p) => p.WardCode === userAddress.ward);
      })
      .catch((err) => console.log(err));

    return {
      province: {
        id: province.ProvinceID,
        name: this.filterProvinceName(province),
      },
      district: {
        id: district.DistrictID,
        name: district.DistrictName,
      },
      ward: {
        id: ward.WardCode,
        name: ward.WardName,
      },
      fullAddress:
        userAddress.detailedAddress +
        ', ' +
        ward.WardName +
        ', ' +
        district.DistrictName +
        ', ' +
        this.filterProvinceName(province),
    };
  }

  async updateDefaultAddress(userId: string, addressId: string) {
    const checkAddress = await this.userAddressesRepository.findOne({
      where: {
        id: addressId,
      },
    });

    if (!checkAddress)
      throw new NotFoundException('User address cannot be found!');

    if (checkAddress.isDefault)
      return {
        message: 'This address has already been default!',
      };

    await this.userAddressesRepository.update(
      { user: { id: userId } },
      { isDefault: false },
    );

    return await this.userAddressesRepository.update(
      { id: addressId },
      { isDefault: true },
    );
  }

  async updateAddress(
    userId: string,
    addressId: string,
    addressDto: UserAddressDTO,
  ) {
    if (addressDto.isDefault) {
      await this.userAddressesRepository.update(
        { user: { id: userId } },
        { isDefault: false },
      );
    }

    return await this.userAddressesRepository.update(addressId, {
      ...addressDto,
    });
  }

  async incrementAddressUsedTime(addressId: string) {
    const address = await this.userAddressesRepository.findOne({
      where: { id: addressId },
    });

    if (!address) throw new NotFoundException('Address cannot be found!');

    return await this.userAddressesRepository.update(addressId, {
      usedTime: address.usedTime + 1,
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.userAddressesRepository.findOne({
      where: { id: addressId },
    });

    const userAddresses = await this.userAddressesRepository.find({
      where: { user: { id: userId } },
      order: { usedTime: 'DESC' },
    });

    if (userAddresses.length > 1) {
      if (address.isDefault) {
        const filteredList = userAddresses.filter(
          (address) => address.id !== addressId,
        );

        if (filteredList.length === 2) {
          let newSelectedDefaultAddress: Address = null;
          if (filteredList[0].usedTime === filteredList[1].usedTime) {
            newSelectedDefaultAddress = filteredList.reduce((prev, current) => {
              return prev &&
                new Date(prev.createdAt) < new Date(current.createdAt)
                ? prev
                : current;
            });
          } else {
            newSelectedDefaultAddress = filteredList.reduce((prev, current) => {
              return prev && prev.usedTime > current.usedTime ? prev : current;
            });
          }
          if (newSelectedDefaultAddress)
            await this.userAddressesRepository.update(
              { id: newSelectedDefaultAddress.id },
              { isDefault: true },
            );
        } else {
          await this.userAddressesRepository.update(
            { id: Not(addressId) },
            { isDefault: true },
          );
        }
      }
    }

    return await this.userAddressesRepository.delete(addressId);
  }
}
