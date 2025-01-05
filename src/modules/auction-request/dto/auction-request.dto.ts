import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateAuctionRequestDto {
  @IsNotEmpty()
  comicId: string;

  @IsInt()
  @Min(0)
  reservePrice: number;

  @IsInt()
  @Min(0)
  maxPrice: number;

  @IsInt()
  @Min(0)
  priceStep: number;

  @IsInt()
  @Min(0)
  depositAmount: number;

  @IsInt()
  @Min(1)
  duration: number;

  @IsEnum(['PENDING', 'APPROVED', 'REJECTED'])
  status: string;
}

export class UpdateAuctionRequestDto {
  @IsOptional()
  @IsEnum(['PENDING', 'APPROVED', 'REJECTED'])
  status?: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
export class ApproveAuctionRequestDto {
  @IsNotEmpty()
  @IsDate()
  startTime: Date;

  @IsNotEmpty()
  @IsDate()
  endTime: Date;
}
export class AuctionRequestResponseDto {
  comicId: string;
  reservePrice: number;
  maxPrice: number;
  priceStep: number;
  depositAmount: number;
  duration: number;
  status: string;
  rejectionReason: string;
}
