import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ExchangeComicsDTO {
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
    description: 'URL for comic cover image',
    example: 'https://example.com/image2.jpg',
    nullable: true,
  })
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
  @IsString({ each: true })
  previewChapter?: string[];

  @ApiProperty({
    description: 'Edition type of the comic (e.g., REGULAR, SPECIAL, LIMITED)',
    example: 'REGULAR',
  })
  @IsEnum(['REGULAR', 'SPECIAL', 'LIMITED'])
  edition: string;

  @ApiProperty({
    description: 'Condition of the comic (e.g., USED, SEALED)',
    example: 'USED',
  })
  @IsEnum(['USED', 'SEALED'])
  condition: string;

  @ApiProperty({
    description: 'Description about the comic',
    example: 'This is a great comic about...',
  })
  @IsString()
  description?: string;

  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  quantity: number;
}
