import { ApiProperty } from '@nestjs/swagger';

export class SellerSubscriptionDTO {
  @ApiProperty()
  sellerSubscriptionPlanId: string;
}
