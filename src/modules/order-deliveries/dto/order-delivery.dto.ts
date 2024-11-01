import { ApiProperty } from '@nestjs/swagger';
import { OrderDeliveryStatusEnum } from './order-delivery-status.enum';

export class OrderDeliveryDTO {
  @ApiProperty()
  orderId: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  province: number;

  @ApiProperty()
  district: number;

  @ApiProperty()
  ward: number;

  @ApiProperty()
  detailedAddress: string;

  @ApiProperty({ nullable: true, default: new Date().toLocaleString() })
  startTime?: Date;

  @ApiProperty({ nullable: true })
  deliveredTime?: Date;

  @ApiProperty({ nullable: true })
  confirmation?: string;

  @ApiProperty({
    type: 'enum',
    enum: OrderDeliveryStatusEnum,
  })
  status: string;

  @ApiProperty({
    nullable: true,
  })
  note?: string;
}
