import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DeliveryInformationService } from './delivery-information.service';
import { CreateDeliveryInformationDto } from './dto/create-delivery-information.dto';
import { UpdateDeliveryInformationDto } from './dto/update-delivery-information.dto';

@Controller('delivery-information')
export class DeliveryInformationController {
  constructor(private readonly deliveryInformationService: DeliveryInformationService) {}

  @Post()
  create(@Body() createDeliveryInformationDto: CreateDeliveryInformationDto) {
    return this.deliveryInformationService.create(createDeliveryInformationDto);
  }

  @Get()
  findAll() {
    return this.deliveryInformationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deliveryInformationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeliveryInformationDto: UpdateDeliveryInformationDto) {
    return this.deliveryInformationService.update(+id, updateDeliveryInformationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deliveryInformationService.remove(+id);
  }
}
