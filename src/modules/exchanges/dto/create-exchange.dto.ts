import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class CreateExchangeDTO {
  @ApiProperty()
  postContent: string;

  @ApiProperty({ nullable: true })
  @IsArray({ each: true })
  @IsString({ each: true })
  images: string[];
}

export class ExchangeDealsDTO {
  @ApiProperty({ default: 0 })
  compensationAmount: number;

  @ApiProperty({ default: 0 })
  depositAmount: number;
}
