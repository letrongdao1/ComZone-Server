import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionPlanDTO {
  @ApiProperty()
  price: number;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  sellTime: number;

  @ApiProperty()
  auctionTime: number;
}
