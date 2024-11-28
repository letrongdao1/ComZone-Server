import { ApiProperty } from '@nestjs/swagger';

export class SellerSubscriptionDTO {
  @ApiProperty()
  planId: string;
}

export class UpdateRemainingTimeDTO {
  @ApiProperty()
  quantity: number;
}
