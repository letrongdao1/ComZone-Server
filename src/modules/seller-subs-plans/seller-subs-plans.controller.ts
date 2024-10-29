import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SellerSubsPlansService } from './seller-subs-plans.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SubscriptionPlanDTO } from './dto/subscription-plan.dto';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { PermissionsGuard } from '../authorization/permission.guard';
import { Roles } from '../authorization/roles.decorator';
import { Role } from '../authorization/role.enum';

@ApiBearerAuth()
@ApiTags('Seller subscription plans')
@Controller('seller-subs-plans')
export class SellerSubsPlansController {
  constructor(
    private readonly sellerSubsPlansService: SellerSubsPlansService,
  ) {}

  @Roles(Role.ADMIN)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Post()
  createNewSellerSubsPlan(@Body() subscriptionPlanDTO: SubscriptionPlanDTO) {
    return this.sellerSubsPlansService.createNewSellerSubsPlan(
      subscriptionPlanDTO,
    );
  }

  @Get()
  getAllSellerSubsPlan() {
    return this.sellerSubsPlansService.getAll();
  }

  @Roles(Role.ADMIN)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateSellerSubsPlan(
    @Param('id') id: string,
    @Body() subscriptionPlanDto: SubscriptionPlanDTO,
  ) {
    return this.sellerSubsPlansService.update(id, subscriptionPlanDto);
  }
}
