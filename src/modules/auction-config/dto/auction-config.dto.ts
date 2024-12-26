import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateAuctionConfigDto {
  @IsNotEmpty()
  @IsNumber()
  maxPriceConfig: number;

  @IsNotEmpty()
  @IsNumber()
  priceStepConfig: number;

  @IsNotEmpty()
  @IsNumber()
  depositAmountConfig: number;
}
export class UpdateAuctionConfigDto {
  @IsOptional()
  @IsNumber()
  maxPriceConfig: number;

  @IsOptional()
  @IsNumber()
  priceStepConfig: number;

  @IsOptional()
  @IsNumber()
  depositAmountConfig: number;
}
