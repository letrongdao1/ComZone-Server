import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateOrderRefundDTO {
  @ApiProperty()
  order: string;

  @ApiProperty()
  reason: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  attachedImages: string[];
}

export class CreateExchangeRefundDTO {
  @ApiProperty()
  exchange: string;

  @ApiProperty()
  reason: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  attachedImages: string[];
}
