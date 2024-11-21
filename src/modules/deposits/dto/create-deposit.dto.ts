import { ApiProperty } from '@nestjs/swagger';

export class CreateDepositDTO {
  @ApiProperty()
  auction: string;

  @ApiProperty()
  amount?: number;
}

export class ExchangeDepositDTO {
  @ApiProperty({ example: 'Exchange ID' })
  exchange: string;
}
