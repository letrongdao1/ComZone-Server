import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Roles } from '../authorization/roles.decorator';
import { Role } from '../authorization/role.enum';
import { PermissionsGuard } from '../authorization/permission.guard';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { CreateOrderDTO } from './dto/createOrderDTO';
import { CancelOrderDTO } from './dto/cancel-order.dto';
import {
  CompleteOrderFailedDTO,
  CompleteOrderSuccessfulDTO,
} from './dto/complete-order.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createNewOrder(@Req() req: any, @Body() createOrderDto: CreateOrderDTO) {
    return this.ordersService.createNewOrder(req.user.id, createOrderDto);
  }

  @Roles(Role.MODERATOR, Role.ADMIN)
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
  @Get('search/user')
  userSearchByComicsSellerAndCode(
    @Req() req: any,
    @Query('search') key: string,
  ) {
    return this.ordersService.userSearchByComicsSellerAndCode(req.user.id, key);
  }

  @Roles(Role.SELLER)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Get('search/seller')
  sellerSearchByComicsBuyerAndCode(
    @Req() req: any,
    @Query('search') key: string,
  ) {
    return this.ordersService.sellerSearchByComicsSellerAndCode(
      req.user.id,
      key,
    );
  }

  @Get('recent/seller/:id')
  getRecentOrdersBySeller(@Param('id') sellerId: string) {
    return this.ordersService.getRecentOrdersBySeller(sellerId);
  }

  @Roles(Role.SELLER)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Get('seller/data')
  getSellerOrderData(@Req() req: any) {
    return this.ordersService.getSellerOrderData(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('delivery-tracking-code/:code')
  getOrderByCode(@Param('code') code: string) {
    return this.ordersService.getOrderByDeliveryTrackingCode(code);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':orderId')
  getOrderById(@Param('orderId') orderId: string) {
    return this.ordersService.getById(orderId);
  }

  @Roles(Role.SELLER)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Post('status/start-packaging/:orderId')
  sellerStartsPackaging(@Param('orderId') orderId: string) {
    return this.ordersService.sellerStartsPackaging(orderId);
  }

  @ApiBody({
    schema: {
      properties: {
        packageImages: {
          type: 'array',
          nullable: false,
          example: ['image.jpg'],
        },
      },
    },
  })
  @Roles(Role.SELLER)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Post('status/finish-packaging/:orderId')
  sellerFinishesPackaging(
    @Param('orderId') orderId: string,
    @Body() data: { packageImages: string[] },
  ) {
    return this.ordersService.sellerFinishesPackaging(
      orderId,
      data.packageImages,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('cancel')
  cancelOrder(@Body() cancelOrderDto: CancelOrderDTO) {
    return this.ordersService.cancelOrder(cancelOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('status/successful')
  completeOrderToBeSuccessful(
    @Req() req: any,
    @Body() dto: CompleteOrderSuccessfulDTO,
  ) {
    return this.ordersService.completeOrderToBeSuccessful(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('status/failed')
  completeOrderToBeFailed(
    @Req() req: any,
    @Body() dto: CompleteOrderFailedDTO,
  ) {
    return this.ordersService.completeOrderToBeFailed(req.user.id, dto);
  }
}
