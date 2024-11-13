import { ApiProperty } from '@nestjs/swagger';

export class CompleteOrderSuccessfulDTO {
  @ApiProperty()
  order: string;

  @ApiProperty({
    type: 'boolean',
    default: false,
  })
  isFeedback: boolean;
}

export class CompleteOrderFailedDTO {
  @ApiProperty()
  order: string;

  @ApiProperty({
    nullable: true,
    example: 'Lí do không nhận được hàng',
  })
  note?: string;
}
