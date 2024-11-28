import { ApiProperty } from '@nestjs/swagger';

export class VNPayRequestDTO {
  @ApiProperty({ nullable: false })
  walletDeposit: string;

  @ApiProperty({ example: '/checkout', nullable: true })
  redirectPath?: string;
}
