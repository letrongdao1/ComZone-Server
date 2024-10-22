import { ApiProperty } from '@nestjs/swagger';

export class VNPayRequest {
  @ApiProperty()
  amount: number;

  @ApiProperty()
  type?: 'PAY' | 'DEPOSIT' | 'WITHDRAWAL';
}
