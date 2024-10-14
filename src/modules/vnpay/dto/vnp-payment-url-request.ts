import { ApiProperty } from '@nestjs/swagger';

export class VNPayRequest {
  @ApiProperty()
  amount: number;

  @ApiProperty()
  orderId: string;
}
