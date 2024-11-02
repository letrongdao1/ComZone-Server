import { ApiProperty } from '@nestjs/swagger';

export class CancelOrderDTO {
  @ApiProperty()
  orderId: string;

  @ApiProperty({ nullable: true })
  cancelReason?: string;
}
