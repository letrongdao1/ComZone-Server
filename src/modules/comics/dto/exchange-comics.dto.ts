import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateExchangeComicsDTO {
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
    example: 'This is a great comic about...',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example: 5,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  condition: number;

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
}
