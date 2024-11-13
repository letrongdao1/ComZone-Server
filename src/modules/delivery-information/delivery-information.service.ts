import { Injectable } from '@nestjs/common';
import { CreateDeliveryInformationDto } from './dto/create-delivery-information.dto';
import { UpdateDeliveryInformationDto } from './dto/update-delivery-information.dto';

@Injectable()
export class DeliveryInformationService {
  create(createDeliveryInformationDto: CreateDeliveryInformationDto) {
    return 'This action adds a new deliveryInformation';
  }

  findAll() {
    return `This action returns all deliveryInformation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} deliveryInformation`;
  }

  update(id: number, updateDeliveryInformationDto: UpdateDeliveryInformationDto) {
    return `This action updates a #${id} deliveryInformation`;
  }

  remove(id: number) {
    return `This action removes a #${id} deliveryInformation`;
  }
}
