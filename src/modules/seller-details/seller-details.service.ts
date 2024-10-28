import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { SellerDetails } from 'src/entities/seller-details.entity';
import { Repository } from 'typeorm';
import { SellerDetailsDTO } from './dto/seller-details';
import { UsersService } from '../users/users.service';

@Injectable()
export class SellerDetailsService extends BaseService<SellerDetails> {
  constructor(
    @InjectRepository(SellerDetails)
    private readonly sellerDetailsRepository: Repository<SellerDetails>,
    private readonly usersService: UsersService,
  ) {
    super(sellerDetailsRepository);
  }

  async createSellerDetails(
    userId: string,
    sellerDetailsDto: SellerDetailsDTO,
  ) {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    const newSellerInfo = this.sellerDetailsRepository.create({
      ...sellerDetailsDto,
      user,
    });

    return await this.sellerDetailsRepository.save(newSellerInfo);
  }

  async getSellerDetails(userId: string) {
    return await this.sellerDetailsRepository.findOne({
      where: { user: { id: userId } },
    });
  }
}
