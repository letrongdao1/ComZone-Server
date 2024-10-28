import { ApiProperty } from '@nestjs/swagger';

export class ZaloPayRequest {
  @ApiProperty({ nullable: false })
  transaction: string;
}
