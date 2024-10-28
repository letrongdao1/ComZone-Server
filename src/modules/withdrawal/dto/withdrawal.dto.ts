import { ApiProperty } from '@nestjs/swagger';

export class WithdrawalDTO {
  @ApiProperty()
  sourceOfFund: string;

  @ApiProperty()
  amount: number;
}
