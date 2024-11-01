import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDTO {
  @ApiProperty()
  totalPrice: number;

  @ApiProperty({ nullable: true })
  paymentMethod?: string;

  @ApiProperty({ nullable: true })
  isPaid?: boolean;

  @ApiProperty({ nullable: true })
  status?: string;
}
