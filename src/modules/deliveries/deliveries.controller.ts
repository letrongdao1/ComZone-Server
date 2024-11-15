import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CreateExchangeRequestDeliveryDTO,
  CreateExchangeOfferDeliveryDTO,
  CreateOrderDeliveryDTO,
} from './dto/create-delivery.dto';
import { GetDeliveryFeeDTO } from './dto/get-delivery-fee.dto';

@ApiBearerAuth()
@ApiTags('Delivery')
@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('order')
  createOrderDelivery(@Body() dto: CreateOrderDeliveryDTO) {
    return this.deliveriesService.createOrderDelivery(dto);
  }

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

  @UseGuards(JwtAuthGuard)
  @Post('details')
  getDeliveryDetails(@Body() getDeliveryFeeDto: GetDeliveryFeeDTO) {
    return this.deliveriesService.getDeliveryDetails(getDeliveryFeeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('exchange-request/:id')
  getByExchangeRequest(@Param('id') id: string) {
    return this.deliveriesService.getByExchangeRequest(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('exchange-offer/:id')
  getByExchangeOffer(@Param('id') id: string) {
    return this.deliveriesService.getByExchangeOffer(id);
  }
}