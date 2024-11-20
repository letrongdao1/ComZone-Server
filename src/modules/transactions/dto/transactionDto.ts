import { ApiProperty } from '@nestjs/swagger';

export class TransactionDTO {
  @ApiProperty({ nullable: true })
  order?: string;

  @ApiProperty({ nullable: true })
  walletDeposit?: string;

  @ApiProperty({ nullable: true })
  withdrawal?: string;

  @ApiProperty({ nullable: true })
  deposit?: string;

  @ApiProperty({ nullable: true })
  sellerSubscription?: string;

  @ApiProperty({ nullable: true })
  exchangeSubscription?: string;

  @ApiProperty({ nullable: true })
  exchange?: string;

  @ApiProperty()
  amount: number;

  @ApiProperty({
    enum: ['PENDING', 'SUCCESSFUL', 'FAILED'],
    default: 'PENDING',
  })
  status?: string;

  @ApiProperty({
    nullable: true,
  })
  paymentGateway?: string;

  @ApiProperty({
    nullable: true,
    default: false,
  })
  isUsed?: boolean;
}
