import { ApiProperty } from '@nestjs/swagger';

export class ExchangeDealsDTO {
  @ApiProperty({ default: 0 })
  compensationAmount: number;

  @ApiProperty({ default: 0 })
  depositAmount: number;
}
