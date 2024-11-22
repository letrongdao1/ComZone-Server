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
import { ExchangeConfirmationService } from './exchange-confirmation.service';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { CreateConfirmationDTO } from './dto/exc-confirmation.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Exchange Confirmation')
@Controller('exchange-confirmation')
export class ExchangeConfirmationController {
  constructor(
    private readonly exchangeConfirmationService: ExchangeConfirmationService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('dealing')
  createNewConfirmation(@Req() req: any, @Body() dto: CreateConfirmationDTO) {
    return this.exchangeConfirmationService.createNewConfirmation(
      req.user.id,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/exchange/:exchange_id')
  getByLoggedInUserAndExchange(
    @Req() req: any,
    @Param('exchange_id') exchangeId: string,
  ) {
    return this.exchangeConfirmationService.getByUserAndExchange(
      req.user.id,
      exchangeId,
    );
  }

  @Get('user/:user_id/exchange/:exchange_id')
  getByUserAndExchange(
    @Param('user_id') userId: string,
    @Param('exchange_id') exchangeId: string,
  ) {
    return this.exchangeConfirmationService.getByUserAndExchange(
      userId,
      exchangeId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('delivery/:exchange_id')
  confirmDelivery(@Req() req: any, @Param('exchange_id') exchangeId: string) {
    return this.exchangeConfirmationService.updateDeliveryConfirmation(
      req.user.id,
      exchangeId,
    );
  }
}
