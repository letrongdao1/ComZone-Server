import {
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsArray,
  IsString,
  Max,
  Min,
  IsBoolean,
  isBoolean,
} from 'class-validator';

export class CreateSellerFeedbackDto {
  @IsNotEmpty()
  user: string;

  @IsNotEmpty()
  seller: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachedImages?: string[];
}

export class UpdateSellerFeedbackDto {
  @IsOptional()
  @IsBoolean()
  isApprove?: boolean;
}
