import { ApiProperty } from '@nestjs/swagger';

export class ZaloPayRequest {
  @ApiProperty()
  amount: number;

  @ApiProperty()
  type?: 'PAY' | 'DEPOSIT' | 'WITHDRAWAL';
}
