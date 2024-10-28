import { ApiProperty } from '@nestjs/swagger';

export class WalletDepositDTO {
  @ApiProperty()
  amount: number;
}
