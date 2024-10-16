import { ApiProperty } from '@nestjs/swagger';

export class ZaloPayRequest {
  @ApiProperty()
  amount: number;

  @ApiProperty()
  orderId: string;
}
