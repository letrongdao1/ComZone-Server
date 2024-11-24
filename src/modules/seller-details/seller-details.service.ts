import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { SellerDetails } from 'src/entities/seller-details.entity';
import { Repository } from 'typeorm';
import { SellerDetailsDTO } from './dto/seller-details';
import { UsersService } from '../users/users.service';
import { VietNamAddressService } from '../viet-nam-address/viet-nam-address.service';

@Injectable()
export class SellerDetailsService extends BaseService<SellerDetails> {
  constructor(
    @InjectRepository(SellerDetails)
    private readonly sellerDetailsRepository: Repository<SellerDetails>,
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(VietNamAddressService)
    private readonly vnAddressService: VietNamAddressService,
  ) {
    super(sellerDetailsRepository);
  }

  async createSellerDetails(
    userId: string,
    sellerDetailsDto: SellerDetailsDTO,
  ) {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    await this.usersService.updateRoleToSeller(userId);

    const newSellerInfo = this.sellerDetailsRepository.create({
      ...sellerDetailsDto,
      user,
    });

    return await this.sellerDetailsRepository
      .save(newSellerInfo)
      .then(() => this.getSellerDetails(userId));
  }

  async getSellerDetails(userId: string) {
    const sellerDetails = await this.sellerDetailsRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!sellerDetails)
      throw new NotFoundException('Cannot find seller details from this user!');

    let foundProvince: { id: number; name: string };
    const provinces = await this.vnAddressService.getProvinces();
    if (provinces) {
      foundProvince = provinces.find(
        (province) => province.id === sellerDetails.province,
      );
    }

    let foundDistrict: { id: number; name: string };
    const districts = await this.vnAddressService.getDistrictsByProvinceCode(
      sellerDetails.province.toString(),
    );
    if (districts) {
      foundDistrict = districts.find(
        (district) => district.id === sellerDetails.district,
      );
    }

    let foundWard: { id: string; name: string };
    const wards = await this.vnAddressService.getWardsByCodes(
      sellerDetails.district.toString(),
    );
    if (wards) {
      foundWard = wards.find((ward) => ward.id === sellerDetails.ward);
    }

    return {
      ...sellerDetails,
      province: foundProvince,
      district: foundDistrict,
      ward: foundWard,
      fullAddress:
        sellerDetails.detailedAddress +
        ', ' +
        foundWard.name +
        ', ' +
        foundDistrict.name +
        ', ' +
        foundProvince.name,
    };
  }

  async updateSellerDebt(userId: string, amount: number, type: 'PAY' | 'GAIN') {
    const sellerDetails = await this.sellerDetailsRepository.findOneBy({
      user: { id: userId },
    });

    if (!sellerDetails) throw new NotFoundException();

    return await this.sellerDetailsRepository.update(sellerDetails.id, {
      debt:
        type === 'PAY'
          ? sellerDetails.debt - amount
          : sellerDetails.debt + amount,
      status:
        type === 'PAY' && sellerDetails.debt - amount === 0
          ? 'ACTIVE'
          : 'DISABLED',
    });
  }
}
