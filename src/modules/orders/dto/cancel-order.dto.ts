import { ApiProperty } from '@nestjs/swagger';

export class CancelOrderDTO {
  @ApiProperty()
  orderId: string;

  @ApiProperty({ example: 'Shipper bị lủng lốp.' })
  cancelReason: string;
}
