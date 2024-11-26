import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SellerFeedback } from '../../entities/seller-feedback.entity';
import {
  CreateSellerFeedbackDto,
  UpdateSellerFeedbackDto,
} from './dto/seller-feedback.dto';

import { User } from '../../entities/users.entity';

@Injectable()
export class SellerFeedbackService {
  constructor(
    @InjectRepository(SellerFeedback)
    private readonly sellerFeedbackRepository: Repository<SellerFeedback>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createFeedback(dto: CreateSellerFeedbackDto): Promise<SellerFeedback> {
    // Find the user and seller by their IDs
    const user = await this.userRepository.findOne({
      where: { id: dto.user },
    });
    const seller = await this.userRepository.findOne({
      where: { id: dto.seller },
    });

    // Check if either user or seller does not exist
    if (!user || !seller) {
      throw new NotFoundException('User or seller not found');
    }

    // Create feedback entity with relations
    const feedback = this.sellerFeedbackRepository.create({
      ...dto,
      user,
      seller,
    });

    // Save and return the feedback
    return this.sellerFeedbackRepository.save(feedback);
  }

  async findAll(): Promise<SellerFeedback[]> {
    return this.sellerFeedbackRepository.find({
      relations: ['user', 'seller'],
    });
  }

  async findOne(id: string): Promise<SellerFeedback> {
    const feedback = await this.sellerFeedbackRepository.findOne({
      where: { id },
    });
    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }
    return feedback;
  }

  async findBySeller(id: string, limit?: number): Promise<any> {
    if (!limit)
      return await this.sellerFeedbackRepository.find({
        where: { seller: { id } },
        relations: ['user', 'seller'],
        order: {
          updatedAt: 'DESC',
          createdAt: 'DESC',
        },
      });
    else {
      const feedbackList = await this.sellerFeedbackRepository.find({
        where: { seller: { id } },
        relations: ['user', 'seller'],
        take: limit,
        order: {
          updatedAt: 'DESC',
          createdAt: 'DESC',
        },
      });

      const totalRating = feedbackList.reduce((prev, feedback) => {
        return prev + feedback.rating;
      }, 0);

      const totalFeedback = await this.sellerFeedbackRepository.count({
        where: { seller: { id } },
      });

      return {
        feedback: feedbackList,
        totalFeedback,
        averageRating: Math.round((totalRating / totalFeedback) * 50) / 10,
      };
    }
  }

  async updateFeedback(
    id: string,
    dto: UpdateSellerFeedbackDto,
  ): Promise<SellerFeedback> {
    await this.sellerFeedbackRepository.update(id, dto);
    return this.findOne(id);
  }
  async approveFeedback(id: string): Promise<SellerFeedback> {
    const feedback = await this.findOne(id);

    feedback.isApprove = true;

    return this.sellerFeedbackRepository.save(feedback);
  }

  async removeFeedback(id: string): Promise<void> {
    const feedback = await this.findOne(id);
    await this.sellerFeedbackRepository.remove(feedback);
  }
}
