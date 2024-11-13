import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateAnnouncementDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  auctionId?: string;

  @IsOptional()
  userId?: string; // ID of the user related to the announcement

  @IsOptional()
  orderId?: string; // ID of the order related to the announcement

  @IsOptional()
  exchangeRequestId?: string; // ID of the exchange request related to the announcement

  @IsOptional()
  exchangeOfferId?: string; // ID of the exchange offer related to the announcement
}

export class UpdateAnnouncementDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  message?: string;

  // @IsOptional()
  // @IsBoolean()
  // isRead?: boolean;
}
