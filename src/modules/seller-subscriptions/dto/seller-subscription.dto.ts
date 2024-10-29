import { ApiProperty } from '@nestjs/swagger';

export class SellerSubscriptionDTO {
  @ApiProperty()
  sellerSubscriptionPlan: string;
}
