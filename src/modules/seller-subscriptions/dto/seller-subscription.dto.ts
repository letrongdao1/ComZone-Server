import { ApiProperty } from '@nestjs/swagger';

export class SellerSubscriptionDTO {
  @ApiProperty()
  planId: string;
}
