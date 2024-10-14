import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { OrderItemsService } from './order-items.service';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Roles } from '../authorization/roles.decorator';
import { Role } from '../authorization/role.enum';
import { PermissionsGuard } from '../authorization/permission.guard';
import { CreateOrderItemDTO } from './dto/createOrderItemDTO';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Order items')
@ApiBearerAuth()
@Controller('order-items')
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('order/:orderId')
  getAllOrderItemsOfOrder(@Param('orderId') orderId: string) {
    return this.orderItemsService.getAllItemsOfOrder(orderId);
  }

  @Roles(Role.MEMBER, Role.SELLER)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Post()
  createOrderItem(@Body() createOrderItemDto: CreateOrderItemDTO) {
    return this.orderItemsService.create(createOrderItemDto);
  }
}
