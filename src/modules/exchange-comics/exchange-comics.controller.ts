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
import { ExchangeComicsService } from './exchange-comics.service';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { CreateExchangeDTO } from './dto/exchange-comics.dto';

@Controller('exchange-comics')
export class ExchangeComicsController {
  constructor(private readonly exchangeComicsService: ExchangeComicsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createRequestOnExchange(@Req() req: any, @Body() dto: CreateExchangeDTO) {
    return this.exchangeComicsService.createRequestOnExchange(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('exchange/:exchange_id')
  getByExchange(@Req() req: any, @Param('exchange_id') id: string) {
    return this.exchangeComicsService.getByExchange(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('rejected/:exchange_id')
  rejectAndUpdateStatusByExchange(
    @Req() req: any,
    @Param('exchange_id') exchangeId: string,
  ) {
    return this.exchangeComicsService.rejectAndUpdateStatusByExchange(
      req.user.id,
      exchangeId,
    );
  }
}
