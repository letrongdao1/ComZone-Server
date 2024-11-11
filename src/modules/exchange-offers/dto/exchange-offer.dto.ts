import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class CreateExchangeOfferDTO {
  @ApiProperty()
  exchangeRequest: string;

  @ApiProperty({
    example: [''],
  })
  @IsArray()
  @IsString({ each: true })
  offerComics: string[];

  @ApiProperty({ nullable: true, default: 0 })
  compensationAmount: number;
}
