import { ApiProperty } from '@nestjs/swagger';

export class ExchangeDealsDTO {
  @ApiProperty({ nullable: true })
  compensateUser?: string;

  @ApiProperty({ nullable: true })
  compensationAmount: number;

  @ApiProperty({ nullable: true })
  depositAmount: number;
}
