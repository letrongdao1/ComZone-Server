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

  // @IsDate()
  // startTime?: Date;

  // @IsDate()
  // endTime?: Date;

  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @IsOptional()
  @IsEnum([
    'PENDING_APPROVAL',
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
  @IsString()
  comicsId?: string;

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
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsDate()
  startTime?: Date;

  @IsOptional()
  @IsNotEmpty()
  @IsDate()
  endTime?: Date;

  @IsOptional()
  @IsEnum([
    'PENDING_APPROVAL',
    'ONGOING',
    'SUCCESSFUL',
    'FAILED',
    'UPCOMING',
    'CANCELED',
    'COMPLETED',
    'STOPPED',
  ])
  status?: string;
}
