import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuctionCriteriaService } from './auction-criteria.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../authorization/roles.decorator';
import { Role } from '../authorization/role.enum';
import { PermissionsGuard } from '../authorization/permission.guard';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { UpdateAuctionCriteriaDTO } from './dto/update-criteria.dto';

@ApiBearerAuth()
@ApiTags('Auction criteria')
@Controller('auction-criteria')
export class AuctionCriteriaController {
  constructor(
    private readonly auctionCriteriaService: AuctionCriteriaService,
  ) {}

  @Get()
  getAuctionCriteriaDetails() {
    return this.auctionCriteriaService.getAuctionCriteriaDetails();
  }

  @Roles(Role.ADMIN)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Patch()
  updateAuctionCriteria(@Body() dto: UpdateAuctionCriteriaDTO) {
    return this.auctionCriteriaService.updateAuctionCriteria(dto);
  }
}
