import { Controller } from '@nestjs/common';
import { SellerSubscriptionsService } from './seller-subscriptions.service';

@Controller('seller-subscriptions')
export class SellerSubscriptionsController {
  constructor(private readonly sellerSubscriptionsService: SellerSubscriptionsService) {}
}
