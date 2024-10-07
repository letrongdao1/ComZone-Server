// src/modules/genre/dto/genre.dto.ts
import { IsNotEmpty } from 'class-validator';

export class CreateGenreDto {
  @IsNotEmpty()
  name: string;
}

export class UpdateGenreDto {
  @IsNotEmpty()
  name?: string;
}
