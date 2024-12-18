import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateBidDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  auctionId: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number;

  @IsString()
  type?: string;
}
export class UpdateBidDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;
}
