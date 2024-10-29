import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionPlanDTO {
  @ApiProperty()
  price: number;

  @ApiProperty({ nullable: true })
  duration?: number;

  @ApiProperty({ nullable: true })
  offeredResource?: number;
}
