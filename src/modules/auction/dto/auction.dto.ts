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
  @IsDate()
  endTime: Date;

  @IsOptional()
  @IsEnum([
    'ONGOING',
    'SUCCESSFUL',
    'FAILED',
    'UPCOMING',
    'CANCELED',
    'COMPLETED',
  ])
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
  @IsNotEmpty()
  @IsDate()
  endTime?: Date;

  @IsOptional()
  @IsEnum([
    'ONGOING',
    'SUCCESSFUL',
    'FAILED',
    'UPCOMING',
    'CANCELED',
    'COMPLETED',
  ])
  status?: string;
}
