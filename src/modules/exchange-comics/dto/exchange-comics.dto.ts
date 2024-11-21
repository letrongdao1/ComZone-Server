import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class CreateExchangeDTO {
  @ApiProperty()
  postId: string;

  @ApiProperty()
  @IsArray({ each: true })
  @IsString({ each: true })
  requestUserComicsList: string[];

  @ApiProperty()
  @IsArray({ each: true })
  @IsString({ each: true })
  postUserComicsList: string[];
}
