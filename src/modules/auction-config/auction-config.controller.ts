import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  // UseGuards,
} from '@nestjs/common';
import { AuctionConfigService } from './auction-config.service';
import {
  CreateAuctionConfigDto,
  UpdateAuctionConfigDto,
} from './dto/auction-config.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
// import { Roles } from '../authorization/roles.decorator';
// import { Role } from '../authorization/role.enum';
// import { PermissionsGuard } from '../authorization/permission.guard';
// import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';

@ApiBearerAuth()
@ApiTags('Auction config')
@Controller('auction-config')
export class AuctionConfigController {
  constructor(private readonly auctionConfigService: AuctionConfigService) {}

  @Post()
  async createConfig(@Body() createAuctionConfigDto: CreateAuctionConfigDto) {
    return await this.auctionConfigService.createConfig(createAuctionConfigDto);
  }

  @Get()
  async getConfig() {
    return await this.auctionConfigService.getConfig();
  }

  // @Roles(Role.ADMIN)
  // @UseGuards(PermissionsGuard)
  // @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateConfig(
    @Param('id') auctionConfigId: string,
    @Body() updateAuctionConfigDto: UpdateAuctionConfigDto,
  ) {
    return await this.auctionConfigService.updateConfig(
      auctionConfigId,
      updateAuctionConfigDto,
    );
  }
}
