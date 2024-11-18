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

  @ApiQuery({ name: 'status', type: 'enum', enum: StatusQueryEnum })
  @UseGuards(JwtAuthGuard)
  @Get('user/status')
  getUserRequestByStatus(
    @Req() req: any,
    @Query('status') status: StatusQueryEnum,
  ) {
    return this.exchangesService.getByStatusQuery(req.user.id, status);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.exchangesService.getOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('accept/:id')
  acceptExchangeRequest(@Req() req: any, @Param('id') id: string) {
    return this.exchangesService.updateExchangeToDealing(req.user.id, id);
  }
}
