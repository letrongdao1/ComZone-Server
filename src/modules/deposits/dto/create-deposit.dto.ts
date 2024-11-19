import { ApiProperty } from '@nestjs/swagger';

export class CreateDepositDTO {
  @ApiProperty({ nullable: true })
  auction?: string;

  @ApiProperty({ nullable: true })
  exchange?: string;

  @ApiProperty()
  amount?: number;
}
