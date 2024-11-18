import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class UpdateRequestOnExchangeDTO {
  @ApiProperty()
  exchangeId: string;

  @ApiProperty()
  @IsArray({ each: true })
  @IsString({ each: true })
  requestUserComicsList: string[];

  @ApiProperty()
  @IsArray({ each: true })
  @IsString({ each: true })
  postUserComicsList: string[];
}
