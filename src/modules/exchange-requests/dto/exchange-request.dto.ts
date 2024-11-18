import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class CreateExchangePostDTO {
  @ApiProperty()
  postContent: string;
}

export class AcceptDealingExchangeDTO {
  @ApiProperty({
    description: 'ID of the exchange',
  })
  exchange: string;

  @ApiProperty({
    description: 'ID of the offer user',
  })
  offerUser: string;
}

export class UpdateExchangeSettingsDTO {
  @ApiProperty()
  depositAmount: number;

  @ApiProperty({ default: false })
  isDeliveryRequired: boolean;
}
