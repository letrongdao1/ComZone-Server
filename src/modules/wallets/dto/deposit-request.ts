import { ApiProperty } from '@nestjs/swagger';

export class DepositRequestDTO {
  @ApiProperty()
  transactionCode: string;
}
