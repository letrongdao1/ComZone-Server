import { ApiProperty } from '@nestjs/swagger';

export class VNPayRequestDTO {
  @ApiProperty({ nullable: false })
  walletDeposit: string;
}
