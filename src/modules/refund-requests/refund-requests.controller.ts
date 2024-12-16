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
import { RefundRequestsService } from './refund-requests.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import {
  CreateExchangeRefundDTO,
  CreateOrderRefundDTO,
} from './dto/create.dto';
import { Roles } from '../authorization/roles.decorator';
import { Role } from '../authorization/role.enum';
import { PermissionsGuard } from '../authorization/permission.guard';
import { RejectReasonDTO } from './dto/reject.dto';

@ApiBearerAuth()
@ApiTags('Refund Requests')
@Controller('refund-requests')
export class RefundRequestsController {
  constructor(private readonly refundRequestsService: RefundRequestsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('order')
  createOrderRefundRequest(@Req() req: any, @Body() dto: CreateOrderRefundDTO) {
    return this.refundRequestsService.createOrderRefundRequest(
      req.user.id,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('exchange')
  createExchangeRefundRequest(
    @Req() req: any,
    @Body() dto: CreateExchangeRefundDTO,
  ) {
    return this.refundRequestsService.createExchangeRefundRequest(
      req.user.id,
      dto,
    );
  }

  @Roles(Role.MODERATOR)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Get('all')
  getAll() {
    return this.refundRequestsService.getAllRefundRequest();
  }

  @Roles(Role.MODERATOR)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Get('orders')
  getAllOrderRefundRequest() {
    return this.refundRequestsService.getAllOrderRefundRequest();
  }

  @Roles(Role.MODERATOR)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Get('exchanges')
  getAllExchangeRefundRequest() {
    return this.refundRequestsService.getAllExchangeRefundRequest();
  }

  @UseGuards(JwtAuthGuard)
  @Get('order/:order_id')
  getByOrder(@Param('order_id') orderId: string) {
    return this.refundRequestsService.getByOrder(orderId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/exchange/:exchange_id')
  getByExchange(@Req() req: any, @Param('exchange_id') exchangeId: string) {
    return this.refundRequestsService.getByExchange(req.user.id, exchangeId);
  }

  @Roles(Role.MODERATOR)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Patch('approve/order/:order_id')
  approveOrderRefundRequest(@Param('order_id') orderId: string) {
    return this.refundRequestsService.approveOrderRefundRequest(orderId);
  }

  @Roles(Role.MODERATOR)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Patch('reject/order/:order_id')
  rejectOrderRefundRequest(
    @Param('order_id') orderId: string,
    @Body() dto: RejectReasonDTO,
  ) {
    return this.refundRequestsService.rejectOrderRefundRequest(
      orderId,
      dto.rejectReason,
    );
  }

  @Roles(Role.MODERATOR)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Patch('approve/exchange/:refund_request_id')
  approveExchangeRefundRequest(
    @Param('refund_request_id') refundRequestId: string,
  ) {
    return this.refundRequestsService.approveExchangeRefundRequest(
      refundRequestId,
    );
  }

  @Roles(Role.MODERATOR)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Patch('reject/exchange/:refund_request_id')
  rejectExchangeRefundRequest(
    @Param('refund_request_id') refundRequestId: string,
    @Body() dto: RejectReasonDTO,
  ) {
    return this.refundRequestsService.rejectExchangeRefundRequest(
      refundRequestId,
      dto.rejectReason,
    );
  }
}
