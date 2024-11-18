import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ExchangeComicsService } from './exchange-comics.service';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { UpdateRequestOnExchangeDTO } from './dto/exchange-comics.dto';

@Controller('exchange-comics')
export class ExchangeComicsController {
  constructor(private readonly exchangeComicsService: ExchangeComicsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createRequestOnExchange(
    @Req() req: any,
    @Body() dto: UpdateRequestOnExchangeDTO,
  ) {
    return this.exchangeComicsService.createRequestOnExchange(req.user.id, dto);
  }
}
