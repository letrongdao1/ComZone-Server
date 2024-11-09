import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerFeedbackService } from './seller-feedback.service';
import { SellerFeedback } from '../../entities/seller-feedback.entity';
import { User } from '../../entities/users.entity';
import { SellerFeedbackController } from './seller-feedback.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SellerFeedback, User]), // Add both entities here
  ],
  providers: [SellerFeedbackService],
  controllers: [SellerFeedbackController],
  exports: [SellerFeedbackService],
})
export class SellerFeedbackModule {}
