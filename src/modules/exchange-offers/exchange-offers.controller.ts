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
import { ExchangeOffersService } from './exchange-offers.service';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateExchangeOfferDTO } from './dto/exchange-offer.dto';
import { ExchangeOfferStatusEnum } from './dto/exchange-offer-status.dto';

@ApiBearerAuth()
@ApiTags('Exchange offers')
@Controller('exchange-offers')
export class ExchangeOffersController {
  constructor(private readonly exchangeOffersService: ExchangeOffersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createNewExchangeOffer(@Req() req: any, @Body() dto: CreateExchangeOfferDTO) {
    return this.exchangeOffersService.createNewExchangeOffer(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('exchange-request/:id')
  getByExchangeRequest(@Param('id') id: string) {
    return this.exchangeOffersService.getByExchangeRequest(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('exchange-request/:request_id/offer-user/:user_id')
  getByExchangeRequestAndOfferUser(
    @Param('user_id') userId: string,
    @Param('request_id') requestId: string,
  ) {
    return this.exchangeOffersService.getByExchangeRequestAndOfferUser(
      userId,
      requestId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('comics/user')
  getExchangeOfferComicsByUser(@Req() req: any) {
    return this.exchangeOffersService.getExchangeOfferComicsByUser(req.user.id);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.exchangeOffersService.getOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('status/seen/:id')
  updateSeenStatus(@Param('id') id: string) {
    return this.exchangeOffersService.updateSeenStatus(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('status/accepted/:id')
  acceptExchangeOffer(@Req() req: any, @Param('id') id: string) {
    return this.exchangeOffersService.updateStatus(
      req.user.id,
      id,
      ExchangeOfferStatusEnum.ACCEPTED,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('status/rejected/:id')
  rejectExchangeOffer(@Req() req: any, @Param('id') id: string) {
    return this.exchangeOffersService.updateStatus(
      req.user.id,
      id,
      ExchangeOfferStatusEnum.REJECTED,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('status/undo/:id')
  undoStatus(@Req() req: any, @Param('id') id: string) {
    return this.exchangeOffersService.updateStatus(
      req.user.id,
      id,
      ExchangeOfferStatusEnum.PENDING,
    );
  }
}
