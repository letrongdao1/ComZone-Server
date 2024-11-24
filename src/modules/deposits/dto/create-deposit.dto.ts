import { ApiProperty } from '@nestjs/swagger';

export class CreateDepositDTO {
  @ApiProperty()
  auction: string;
}

export class ExchangeDepositDTO {
  @ApiProperty({ example: 'Exchange ID' })
  exchange: string;
}
