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
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ComicsStatusEnum } from './comic-status.enum';
import { ComicsTypeEnum } from './comic-type.enum';

export class CreateComicDto {
  @ApiProperty({
    description: 'ID of the seller creating the comic',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  sellerId: string;

  @ApiProperty({
    description: 'Array of genre IDs associated with the comic',
    example: ['genre1', 'genre2'],
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  genreIds: string[];

  @ApiProperty({
    description: 'Title of the comic',
    example: 'Comic Title',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Author of the comic',
    example: 'Author Name',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  author: string;

  @ApiProperty({
    description: 'Description of the comic',
    example: 'This is a great comic about...',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({
    description: 'Array of URLs for comic cover images',
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
  })
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  coverImage: string;

  @ApiProperty({
    description: 'Price of the comic',
    example: 19.99,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({
    description: 'Status of the comic',
    example: 'AVAILABLE',
  })
  @IsEnum(ComicsStatusEnum)
  status: ComicsStatusEnum;

  @ApiProperty({
    description: 'Quantity of comics available',
    example: 10,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({
    description: 'Episodes list of comics collection',
    example: ['Volume 19', 'Episode 73'],
    nullable: true,
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  episodesList?: string[];

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
    description: 'Edition type of the comic (e.g., REGULAR, SPECIAL, LIMITED)',
    example: 'REGULAR',
  })
  @IsEnum(['REGULAR', 'SPECIAL', 'LIMITED'])
  edition: string;

  @ApiProperty({
    example: 'Year of publication',
  })
  publishedDate: string;

  @ApiProperty({
    description: 'Condition of the comic (e.g., USED, SEALED)',
    example: 'USED',
  })
  @IsEnum(['USED', 'SEALED'])
  condition: string;

  @ApiProperty({
    description: 'Total number of pages in the comic',
    example: 120,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  page?: number;
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
