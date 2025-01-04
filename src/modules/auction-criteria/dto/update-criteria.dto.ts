import { ApiProperty } from '@nestjs/swagger';

export class UpdateAuctionCriteriaDTO {
  @ApiProperty({
    description: 'Require every comics information field to be filled.',
    example: true,
  })
  isFullInfoFilled: boolean;

  @ApiProperty({ description: 'Minimum condition level.', example: 4 })
  conditionLevel: number;

  @ApiProperty({
    description: 'IDs of comics edition that are NOT ALLOWED to be auctioned.',
    example: [
      '085b30f2-3acb-42f8-9b45-f81673015011',
      '5261e84c-23a5-4109-8d54-7af740e4df60',
    ],
  })
  disallowedEdition: string[];
}
