import { ApiProperty } from '@nestjs/swagger';

export class TransactionDTO {
  @ApiProperty()
  amount: number;

  @ApiProperty({
    enum: ['DEPOSIT', 'WITHDRAWAL', 'PAY'],
    default: 'PAY',
  })
  type?: string;

  @ApiProperty({
    enum: ['PENDING', 'SUCCESSFUL', 'FAILED'],
    default: 'PENDING',
  })
  status?: string;

  @ApiProperty({
    nullable: true,
  })
  provider?: string;
}
