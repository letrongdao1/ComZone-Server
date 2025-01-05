import { IsString, IsBoolean, IsOptional } from 'class-validator';
import {
  AnnouncementType,
  RecipientType,
} from 'src/entities/announcement.entity';

export class CreateAnnouncementDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  status?: string;

  @IsOptional()
  type?: AnnouncementType;

  @IsOptional()
  auctionId?: string;

  @IsOptional()
  userId?: string; // ID of the user related to the announcement

  @IsOptional()
  orderId?: string; // ID of the order related to the announcement

  @IsOptional()
  exchangeId?: string; // ID of the exchange request related to the announcement

  @IsOptional()
  transactionId?: string; // ID of the transaction related to the announcement

  @IsOptional()
  auctionRequestId?: string;
  @IsOptional()
  recipientType?: RecipientType;
}

export class UpdateAnnouncementDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
