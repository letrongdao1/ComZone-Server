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
  CreateExchangeDeliveryDTO,
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
  @Post('exchange')
  createExchangeDelivery(
    @Req() req: any,
    @Body() dto: CreateExchangeDeliveryDTO,
  ) {
    return this.deliveriesService.createExchangeDelivery(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('details/:delivery_id')
  getDeliveryDetailsByDeliveryId(@Param('delivery_id') id: string) {
    return this.deliveriesService.getDeliveryDetailsByDeliveryId(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('details')
  getDeliveryDetails(@Body() getDeliveryFeeDto: GetDeliveryFeeDTO) {
    return this.deliveriesService.getDeliveryDetails(getDeliveryFeeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('exchange/:id')
  getByExchange(@Param('id') id: string) {
    return this.deliveriesService.getByExchange(id);
  }
}
