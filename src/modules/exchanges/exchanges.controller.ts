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
import { ExchangesService } from './exchanges.service';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { CreateExchangeDTO, ExchangeDealsDTO } from './dto/create-exchange.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ExchangeStatusEnum } from './dto/exchange-status-enum';
import { StatusQueryEnum } from './dto/status-query.enum';

@ApiBearerAuth()
@ApiTags('Exchanges')
@Controller('exchanges')
export class ExchangesController {
  constructor(private readonly exchangesService: ExchangesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createNewExchange(@Req() req: any, @Body() dto: CreateExchangeDTO) {
    return this.exchangesService.createNewExchange(req.user.id, dto);
  }

  @Get('all/pending')
  getAllExchangePendingPosts() {
    return this.exchangesService.getAllPendingExchanges();
  }

  @Get('search')
  getSearchedPosts(@Query('key') key: string) {
    return this.exchangesService.getSearchedPosts(key);
  }

  @ApiQuery({ name: 'status', type: 'enum', enum: StatusQueryEnum })
  @UseGuards(JwtAuthGuard)
  @Get('user/status')
  getUserRequestByStatus(
    @Req() req: any,
    @Query('status') status: StatusQueryEnum,
  ) {
    return this.exchangesService.getByStatusQuery(req.user.id, status);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('deals/:exchange_id')
  updateDeals(
    @Req() req: any,
    @Param('exchange_id') exchangeId: string,
    @Body() dto: ExchangeDealsDTO,
  ) {
    return this.exchangesService;
  }
}
