import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SellerInformationService } from './seller-information.service';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { SellerInformationDTO } from './dto/seller-information';
import { Roles } from '../authorization/roles.decorator';
import { Role } from '../authorization/role.enum';
import { PermissionsGuard } from '../authorization/permission.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Seller information')
@Controller('seller-information')
export class SellerInformationController {
  constructor(
    private readonly sellerInformationService: SellerInformationService,
  ) {}

  @Roles(Role.MEMBER)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Post()
  createSellerInformation(
    @Req() req: any,
    @Body() sellerInformationDto: SellerInformationDTO,
  ) {
    return this.sellerInformationService.createSellerInformation(
      req.user.id,
      sellerInformationDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getSellerInformationOfUser(@Req() req: any) {
    return this.sellerInformationService.getSellerInformation(req.user.id);
  }
}
