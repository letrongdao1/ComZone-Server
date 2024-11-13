import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CreateExchangeRequestDeliveryDTO,
  CreateExchangeOfferDeliveryDTO,
} from './dto/create-delivery.dto';

@ApiBearerAuth()
@ApiTags('Delivery')
@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('exchange-request')
  createExchangeRequestDelivery(@Body() dto: CreateExchangeRequestDeliveryDTO) {
    return this.deliveriesService.createExchangeRequestDelivery(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('exchange-offer')
  createNewExchangeOfferDelivery(@Body() dto: CreateExchangeOfferDeliveryDTO) {
    return this.deliveriesService.createExchangeOfferDelivery(dto);
  }
}
