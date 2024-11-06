import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class CreateExchangePostDTO {
  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  requestedComics: string[];

  @ApiProperty()
  description: string;
}
