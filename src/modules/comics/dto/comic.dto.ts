import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  IsPositive,
  MinLength,
  MaxLength,
  Min,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ComicsStatusEnum } from './comic-status.enum';

export class CreateComicDto {
  @ApiProperty({
    example: 'Conan 101',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Gashimoto Kinya',
  })
  @IsNotEmpty()
  @IsString()
  author: string;

  @ApiProperty({
    description: 'Quantity of comics',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Episodes list of comics collection',
    example: ['Volume 19', 'Episode 73'],
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  episodesList?: string[];

  @ApiProperty({
    description: 'Array of genre IDs associated with the comic',
    example: ['genreID1', 'genreID2'],
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  genres: string[];

  @ApiProperty({
    example: 'This is a great comic about...',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example: 'SOFT',
  })
  @IsNotEmpty()
  @IsEnum({ SOFT: 'SOFT', HARD: 'HARD', DETACHED: 'DETACHED' })
  cover: 'SOFT' | 'HARD' | 'DETACHED';

  @ApiProperty({
    example: 'GRAYSCALE',
  })
  @IsNotEmpty()
  @IsEnum({ GRAYSCALE: 'GRAYSCALE', COLORED: 'COLORED' })
  color: 'GRAYSCALE' | 'COLORED';

  @ApiProperty({
    example: 224,
    nullable: true,
  })
  @IsPositive()
  @IsOptional()
  page?: number;

  @ApiProperty({
    example: 224,
    nullable: true,
  })
  @IsPositive()
  @IsOptional()
  length?: number;

  @ApiProperty({
    example: 224,
    nullable: true,
  })
  @IsPositive()
  @IsOptional()
  width?: number;

  @ApiProperty({
    example: 224,
    nullable: true,
  })
  @IsPositive()
  @IsOptional()
  thickness?: number;

  @ApiProperty({
    example: ['merchandiseID1', 'merchandiseID2'],
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  merchandises?: string[];

  @ApiProperty({
    example: 'Nhà xuất bản Kim Đồng',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  publisher?: string;

  @ApiProperty({
    example: 2019,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  publicationYear?: number;

  @ApiProperty({
    example: 'Nhật Bản',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  originCountry?: string;

  @ApiProperty({
    example: 2019,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  releaseYear?: number;

  @ApiProperty({
    example: 5,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  condition: number;

  @ApiProperty({
    example: 'editionID',
  })
  @IsNotEmpty()
  @IsString()
  edition: string;

  @ApiProperty({
    example: false,
    default: false,
  })
  @IsBoolean()
  willNotAuction: boolean;

  @ApiProperty({
    example: 'https://example.com/image1.jpg',
  })
  @IsNotEmpty()
  @IsString()
  coverImage: string;

  @ApiProperty({
    description: 'Array of preview chapter URLs',
    example: [
      'https://example.com/preview1.jpg',
      'https://example.com/preview2.jpg',
    ],
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  previewChapter: string[];

  @ApiProperty({
    example: 25000,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number;
}

export class UpdateComicDto {
  @ApiProperty({
    description: 'ID of the seller updating the comic',
    example: '123456',
    required: false,
  })
  @IsOptional()
  @IsString()
  sellerId?: string;

  @ApiProperty({
    description: 'Array of genre IDs associated with the comic',
    example: ['genre1', 'genre2'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  genreIds?: string[];

  @ApiProperty({
    description: 'Title of the comic',
    example: 'Updated Comic Title',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  title?: string;

  @ApiProperty({
    description: 'Author of the comic',
    example: 'Updated Author Name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  author?: string;

  @ApiProperty({
    description: 'Description of the comic',
    example: 'This is an updated description for the comic...',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @ApiProperty({
    description: 'Array of URLs for comic cover images',
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    required: false,
  })
  @IsOptional()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  coverImage?: string;

  @ApiProperty({
    description: 'Price of the comic',
    example: 24.99,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @ApiProperty({
    example: 'string',
  })
  @IsOptional()
  publishedDate?: string;

  @ApiProperty({
    description: 'Status of the comic',
    example: 'AVAILABLE',
    required: false,
  })
  @IsOptional()
  @IsEnum(ComicsStatusEnum)
  status?: ComicsStatusEnum;

  @ApiProperty({
    description: 'Quantity of comics available',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  quantity?: number;

  @ApiProperty({
    description: 'Array of preview chapter URLs',
    example: [
      'https://example.com/preview1.jpg',
      'https://example.com/preview2.jpg',
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  previewChapter?: string[];
  @ApiProperty({
    description: 'Edition type of the comic (e.g., REGULAR, SPECIAL, LIMITED)',
    example: 'REGULAR',
    required: false,
  })
  @IsOptional()
  @IsEnum(['REGULAR', 'SPECIAL', 'LIMITED'])
  edition?: string;

  @ApiProperty({
    description: 'Condition of the comic (e.g., USED, SEALED)',
    example: 'USED',
    required: false,
  })
  @IsOptional()
  @IsEnum(['USED', 'SEALED'])
  condition?: string;

  @ApiProperty({
    description: 'Total number of pages in the comic',
    example: 120,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  page?: number;
}

export class UpdateComicStatusDto {
  @IsEnum(ComicsStatusEnum, { message: 'Status must be a valid enum value' })
  status: ComicsStatusEnum;
}
