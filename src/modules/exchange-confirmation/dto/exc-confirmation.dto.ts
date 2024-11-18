import { ApiProperty } from '@nestjs/swagger';

export class CreateConfirmationDTO {
  @ApiProperty()
  exchangeId: string;

  @ApiProperty({ default: 0 })
  compensationAmount: number;

  @ApiProperty({ default: 0 })
  depositAmount: number;
}
