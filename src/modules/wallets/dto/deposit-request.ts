import { ApiProperty } from '@nestjs/swagger';

export class DepositRequestDTO {
  @ApiProperty()
  transactionCode: string;

  @ApiProperty({
    nullable: true,
    default: 0,
  })
  nonWithdrawableAmount?: number;
}
