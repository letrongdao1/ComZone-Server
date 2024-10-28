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
  images: string[];

  @ApiProperty()
  price: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  quantity: number;

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
  images?: string[];

  @ApiProperty()
  price?: number;

  @ApiProperty()
  status?: string;

  @ApiProperty()
  quantity?: number;

  @ApiProperty()
  previewChapter?: string[];
}

export enum ComicStatus {
  AVAILABLE = 'AVAILABLE',
  UNAVAILABLE = 'UNAVAILABLE',
  PENDING = 'PENDING',
  SOLD = 'SOLD',
  AUCTION = 'AUCTION',
  EXCHANGE = 'EXCHANGE',
  DELETED = 'DELETED',
}

export class UpdateComicStatusDto {
  @IsEnum(ComicStatus)
  status: ComicStatus;
}
