import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsDate,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAuctionDto {
  @IsNotEmpty()
  @IsString()
  comicsId: string;

  @IsNotEmpty()
  @IsNumber()
  reservePrice: number;

  @IsNotEmpty()
  @IsNumber()
  maxPrice: number;

  @IsNotEmpty()
  @IsNumber()
  priceStep: number;

  @IsNotEmpty()
  @IsDate()
  startTime: Date;

  @IsNotEmpty()
  @IsEnum([1, 2, 3, 4, 5, 6, 7], {
    message: 'Duration must be between 1 and 7 days',
  })
  duration: number;

  @IsOptional()
  @IsEnum(['ONGOING', 'SUCCESSFUL', 'FAILED'])
  status: string;
}

export class UpdateAuctionDto {
  @IsOptional()
  @IsNumber()
  reservePrice?: number;

  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsNumber()
  priceStep?: number;

  @IsOptional()
  @IsDate()
  startTime?: Date;

  @IsOptional()
  @IsEnum([1, 2, 3, 4, 5, 6, 7], {
    message: 'Duration must be between 1 and 7 days',
  })
  duration?: number;

  @IsOptional()
  @IsEnum(['ONGOING', 'SUCCESSFUL', 'FAILED'])
  status?: string;
}
