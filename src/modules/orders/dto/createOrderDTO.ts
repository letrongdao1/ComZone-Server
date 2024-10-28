import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDTO {
  @ApiProperty()
  total_price: number;

  @ApiProperty({ nullable: true })
  order_type?: string;

  @ApiProperty({ nullable: true })
  payment_method?: string;

  @ApiProperty({ nullable: true })
  is_paid?: boolean;

  @ApiProperty({ nullable: true })
  status?: string;
}
