import { ApiProperty } from '@nestjs/swagger';

export class WalletDepositTransactionDTO {
  @ApiProperty()
  walletDeposit: string;
}

export class OrderPayTransactionDTO {
  @ApiProperty()
  order: string;
}
