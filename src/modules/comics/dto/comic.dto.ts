import { IsEnum } from 'class-validator';

export class CreateComicDto {
  sellerId: string;
  genreIds: string[];
  title: string;
  author: string;
  description: string;
  coverImage: string[];
  publishedDate: Date;
  price: number;
  status: string;
  quantity: number;
  previewChapter: string[];
  isAuction: boolean;
  isExchange: boolean;
  comicCommission: number;
}

export class UpdateComicDto {
  sellerId?: string;
  genreIds?: string[];
  title?: string;
  author?: string;
  description?: string;
  coverImage?: string[];
  publishedDate?: Date;
  price?: number;
  status?: string;
  quantity?: number;
  previewChapter?: string[];
  isAuction?: boolean;
  isExchange?: boolean;
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
