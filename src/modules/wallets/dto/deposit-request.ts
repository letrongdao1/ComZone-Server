import { ApiProperty } from '@nestjs/swagger';

export class DepositRequest {
  @ApiProperty()
  requestId: string;

  @ApiProperty()
  amount: number;
}
