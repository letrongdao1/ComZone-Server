import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SellerSubscriptionsService } from './seller-subscriptions.service';
import { Roles } from '../authorization/roles.decorator';
import { Role } from '../authorization/role.enum';
import { PermissionsGuard } from '../authorization/permission.guard';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { SellerSubscriptionDTO } from './dto/seller-subscription.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Seller subscription')
@Controller('seller-subscriptions')
export class SellerSubscriptionsController {
  constructor(
    private readonly sellerSubscriptionsService: SellerSubscriptionsService,
  ) {}

  @Roles(Role.SELLER)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Post()
  registerNewSellerSubscription(
    @Req() req: any,
    @Body() sellerSubscriptionDto: SellerSubscriptionDTO,
  ) {
    return this.sellerSubscriptionsService.registerNewSellerSubscription(
      req.user.id,
      sellerSubscriptionDto,
    );
  }

  @Roles(Role.MODERATOR)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Get()
  getAllSellerSubscriptions() {
    return this.sellerSubscriptionsService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  getSellerSubscriptionOfUser(@Req() req: any) {
    return this.sellerSubscriptionsService;
  }
}
