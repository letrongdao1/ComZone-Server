import { ApiProperty } from '@nestjs/swagger';

export class OrderDeliveryDTO {
  @ApiProperty()
  orderId: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  province: string;

  @ApiProperty()
  district: string;

  @ApiProperty()
  ward: string;

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
    enum: ['ONGOING', 'SUCCESSFUL', 'FAILED'],
    default: 'ONGOING',
  })
  status: string;

  @ApiProperty({
    nullable: true,
  })
  note?: string;
}
