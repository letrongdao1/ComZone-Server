import { ApiProperty } from '@nestjs/swagger';

export class WalletDTO {
  @ApiProperty()
  balance: number;

  @ApiProperty({
    nullable: true,
  })
  nonWithdrawableAmount: number;

  @ApiProperty({
    nullable: true,
    enum: ['DISABLED', 'ACTIVATED'],
  })
  status: string;
}
