import { ApiProperty } from '@nestjs/swagger';

export class WithdrawRequestDTO {
  @ApiProperty()
  amount: number;
}
