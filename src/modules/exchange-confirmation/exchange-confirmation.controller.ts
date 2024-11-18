import { Controller } from '@nestjs/common';
import { ExchangeConfirmationService } from './exchange-confirmation.service';

@Controller('exchange-confirmation')
export class ExchangeConfirmationController {
  constructor(private readonly exchangeConfirmationService: ExchangeConfirmationService) {}
}
