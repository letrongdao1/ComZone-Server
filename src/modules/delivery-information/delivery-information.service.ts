import { Inject, Injectable } from '@nestjs/common';
import { CreateDeliveryInformationDTO } from './dto/create-delivery-information.dto';
import { BaseService } from 'src/common/service.base';
import { DeliveryInformation } from 'src/entities/delivery-information.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class DeliveryInformationService extends BaseService<DeliveryInformation> {
  constructor(
    @InjectRepository(DeliveryInformation)
    private readonly deliveryInfoRepository: Repository<DeliveryInformation>,
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {
    super(deliveryInfoRepository);
  }

  async createNewDeliveryInfo(
    userId: string,
    dto: CreateDeliveryInformationDTO,
  ) {
    const user = await this.usersService.getOne(userId);

    const newDeliveryInfo = this.deliveryInfoRepository.create({
      ...dto,
      user,
    });

    return await this.deliveryInfoRepository.save(newDeliveryInfo);
  }

  async getByUserId(userId: string) {
    return await this.deliveryInfoRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: {
        updatedAt: 'DESC',
      },
    });
  }
}
