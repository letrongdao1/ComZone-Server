import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../authorization/roles.decorator';
import { Role } from '../authorization/role.enum';
import { PermissionsGuard } from '../authorization/permission.guard';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { CreateOrderDTO } from './dto/createOrderDTO';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles(Role.MODERATOR)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Get()
  getAllOrders() {
    return this.ordersService.getAll();
  }

  @Roles(Role.MEMBER, Role.SELLER)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Post()
  createNewOrder(@Body() createOrderDto: CreateOrderDTO) {
    return this.ordersService.create(createOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('buyer/:userId')
  getAllOrdersOfBuyer(@Param('userId') userId: string) {
    return this.ordersService.getAllOrdersOfBuyer(userId);
  }

  @Roles(Role.SELLER, Role.MODERATOR)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Get('seller/:userId')
  getAllOrdersOfSeller(@Param('userId') userId: string) {
    return this.ordersService.getAllOrdersOfSeller(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:orderId')
  getOrderById(@Param('orderId') orderId: string) {
    return this.ordersService.getOne(orderId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('status/:orderId')
  updateOrderStatus(@Param('orderId') orderId: string) {}
}
