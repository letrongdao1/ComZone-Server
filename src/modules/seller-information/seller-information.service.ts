import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { SellerInformation } from 'src/entities/seller_information.entity';
import { Repository } from 'typeorm';
import { SellerInformationDTO } from './dto/seller-information';
import { UsersService } from '../users/users.service';

@Injectable()
export class SellerInformationService extends BaseService<SellerInformation> {
  constructor(
    @InjectRepository(SellerInformation)
    private readonly sellerInformationRepository: Repository<SellerInformation>,
    private readonly usersService: UsersService,
  ) {
    super(sellerInformationRepository);
  }

  async createSellerInformation(
    userId: string,
    sellerInformationDto: SellerInformationDTO,
  ) {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    const newSellerInfo = this.sellerInformationRepository.create({
      ...sellerInformationDto,
      user,
    });

    return await this.sellerInformationRepository.save(newSellerInfo);
  }

  async getSellerInformation(userId: string) {
    return await this.sellerInformationRepository.findOne({
      where: { user: { id: userId } },
    });
  }
}
