import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class CreateOrderRefundDTO {
  @ApiProperty()
  order: string;

  @ApiProperty()
  reason: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ nullable: true })
  @IsArray()
  @IsString({ each: true })
  attachedImages?: string[];
}

export class CreateExchangeRefundDTO {
  @ApiProperty()
  exchange: string;

  @ApiProperty()
  reason: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ nullable: true })
  @IsArray()
  @IsString({ each: true })
  attachedImages?: string[];
}
