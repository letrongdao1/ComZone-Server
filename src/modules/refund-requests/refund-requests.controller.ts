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
import { RefundRequestStatusEnum } from './dto/status.enum';

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

  @Roles(Role.MODERATOR)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Patch('approve/:id')
  approveRefundRequest(@Param('id') id: string) {
    return this.refundRequestsService.updateStatus(
      id,
      RefundRequestStatusEnum.APPROVED,
    );
  }

  @Roles(Role.MODERATOR)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Patch('reject/:id')
  rejectRefundRequest(@Param('id') id: string) {
    return this.refundRequestsService.updateStatus(
      id,
      RefundRequestStatusEnum.REJECTED,
    );
  }
}
