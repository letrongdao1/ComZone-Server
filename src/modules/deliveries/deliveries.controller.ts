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
import { Roles } from '../authorization/roles.decorator';
import { Role } from '../authorization/role.enum';
import { PermissionsGuard } from '../authorization/permission.guard';

@ApiBearerAuth()
@ApiTags('Delivery')
@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Roles(Role.MODERATOR)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Get('all')
  getAllDeliveries() {
    return this.deliveriesService.getAll();
  }

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
  @Post('details')
  getDeliveryDetails(@Body() getDeliveryFeeDto: GetDeliveryFeeDTO) {
    return this.deliveriesService.getDeliveryDetails(getDeliveryFeeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('attempt/register/:id')
  attemptToRegisterGHN(@Param('id') deliveryId: string) {
    return this.deliveriesService.registerNewGHNDelivery(deliveryId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('details/:delivery_id')
  getDeliveryDetailsByDeliveryId(@Param('delivery_id') id: string) {
    return this.deliveriesService.getDeliveryDetailsByDeliveryId(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('order/:order_id')
  getByOrder(@Param('order_id') id: string) {
    return this.deliveriesService.getByOrder(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('exchange/:exchange_id')
  getByExchange(@Param('exchange_id') id: string) {
    return this.deliveriesService.getByExchange(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('exchange/from-user/:exchange_id')
  getByExchangeAndFromUser(@Req() req: any, @Param('exchange_id') id: string) {
    return this.deliveriesService.getByExchangeAndFromUser(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('exchange/to-user/:exchange_id')
  getByExchangeAndToUser(@Req() req: any, @Param('exchange_id') id: string) {
    return this.deliveriesService.getByExchangeAndToUser(req.user.id, id);
  }
}
