// src/modules/genre/dto/genre.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateGenreDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;
}

export class UpdateGenreDto {
  @ApiProperty()
  @IsNotEmpty()
  name?: string;
}
