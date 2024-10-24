import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../authorization/roles.decorator';
import { Role } from '../authorization/role.enum';
import { PermissionsGuard } from '../authorization/permission.guard';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { CreateOrderDTO } from './dto/createOrderDTO';
import { OrderStatusEnum } from './dto/order-status.enum';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles(Role.MEMBER, Role.SELLER)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Post()
  createNewOrder(@Req() req: any, @Body() createOrderDto: CreateOrderDTO) {
    return this.ordersService.createNewOrder(req.user.id, createOrderDto);
  }

  @Roles(Role.MODERATOR)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Get()
  getAllOrders() {
    return this.ordersService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  getAllOrdersOfUser(@Req() req: any) {
    return this.ordersService.getAllOrdersOfUser(req.user.id);
  }

  @Roles(Role.SELLER)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Get('seller')
  getAllOrdersOfSeller(@Req() req: any) {
    return this.ordersService.getAllOrdersOfSeller(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/code/:code')
  getOrderByCode(@Param('code') code: string) {
    return this.ordersService.getOrderByCode(code);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:orderId')
  getOrderById(@Param('orderId') orderId: string) {
    return this.ordersService.getOne(orderId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('status/:orderId')
  updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() data: { status: OrderStatusEnum },
  ) {
    return this.ordersService.updateOrderStatus(orderId, data.status);
  }
}
