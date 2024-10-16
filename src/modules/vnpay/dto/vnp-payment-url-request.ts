import { ApiProperty } from '@nestjs/swagger';

export class VNPayRequest {
  @ApiProperty()
  amount: number;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  type?: 'PAY' | 'DEPOSIT' | 'WITHDRAWAL';
}
