import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SellerDetailsService } from './seller-details.service';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { SellerDetailsDTO } from './dto/seller-details';
import { Roles } from '../authorization/roles.decorator';
import { Role } from '../authorization/role.enum';
import { PermissionsGuard } from '../authorization/permission.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Seller details')
@Controller('seller-details')
export class SellerDetailsController {
  constructor(private readonly sellerDetailsService: SellerDetailsService) {}

  @Roles(Role.MEMBER, Role.SELLER)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Post()
  createSellerInformation(
    @Req() req: any,
    @Body() sellerDetailsDto: SellerDetailsDTO,
  ) {
    return this.sellerDetailsService.createSellerDetails(
      req.user.id,
      sellerDetailsDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getSellerInformationOfUser(@Req() req: any) {
    return this.sellerDetailsService.getSellerDetails(req.user.id);
  }
}
