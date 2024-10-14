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
  publishedDate: Date;

  @ApiProperty()
  price: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  previewChapter: string[];

  @ApiProperty()
  isAuction: boolean;

  @ApiProperty()
  isExchange: boolean;

  @ApiProperty()
  comicCommission: number;
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
  publishedDate?: Date;

  @ApiProperty()
  price?: number;

  @ApiProperty()
  status?: string;

  @ApiProperty()
  quantity?: number;

  @ApiProperty()
  previewChapter?: string[];

  @ApiProperty()
  isAuction?: boolean;

  @ApiProperty()
  @ApiProperty()
  isExchange?: boolean;

  @ApiProperty()
  comicCommission?: number;
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
