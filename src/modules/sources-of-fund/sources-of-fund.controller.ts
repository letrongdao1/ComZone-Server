import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SourcesOfFundService } from './sources-of-fund.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { SourceOfFundDTO } from './dto/source-of-fund.dto';

@ApiBearerAuth()
@ApiTags('Sources of fund')
@Controller('sources-of-fund')
export class SourcesOfFundController {
  constructor(private readonly sourcesOfFundService: SourcesOfFundService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createNewSourceOfFund(
    @Req() req: any,
    @Body() sourceOfFundDTO: SourceOfFundDTO,
  ) {
    return this.sourcesOfFundService.createNewSourceOfFund(
      req.user.id,
      sourceOfFundDTO,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  getUserSourcesOfFund(@Req() req: any) {
    return this.sourcesOfFundService.getUserSourcesOfFund(req.user.id);
  }
}
