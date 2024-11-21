import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class CreateExchangePostDTO {
  @ApiProperty()
  postContent: string;

  @ApiProperty({ nullable: true })
  @IsArray({ each: true })
  @IsString({ each: true })
  images: string[];
}
