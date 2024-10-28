import { IsEnum } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateComicDto {
  @ApiProperty()
  sellerId: string;

  @ApiProperty()
  genreIds: string[];

  @ApiProperty()
  title: string;

  @ApiProperty()
  author: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  coverImage: string[];

  @ApiProperty()
  price: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  side_images: string[];

  @ApiProperty()
  previewChapter: string[];
}

export class UpdateComicDto {
  @ApiProperty()
  sellerId?: string;

  @ApiProperty()
  genreIds?: string[];

  @ApiProperty()
  title?: string;

  @ApiProperty()
  author?: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  coverImage?: string[];

  @ApiProperty()
  price?: number;

  @ApiProperty()
  status?: string;

  @ApiProperty()
  quantity?: number;

  @ApiProperty()
  side_images: string[];

  @ApiProperty()
  previewChapter?: string[];
}

export enum ComicStatus {
  AVAILABLE = 'AVAILABLE',
  UNAVAILABLE = 'UNAVAILABLE',
  PENDING = 'PENDING',
  SOLD = 'SOLD',
}

export class UpdateComicStatusDto {
  @IsEnum(ComicStatus)
  status: ComicStatus;
}
