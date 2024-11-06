import { Body, Controller, Post, Req } from '@nestjs/common';
import { ExchangesService } from './exchanges.service';
import { CreateExchangePostDTO } from './dto/exchange.dto';

@Controller('exchanges')
export class ExchangesController {
  constructor(private readonly exchangesService: ExchangesService) {}

  @Post()
  createExchangePost(
    @Req() req: any,
    @Body() createExchangePostDto: CreateExchangePostDTO,
  ) {
    return this.exchangesService.createExchangePost(
      req.user.id,
      createExchangePostDto,
    );
  }
}
