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
    return this.sellerFeedbackRepository.find();
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

  async updateFeedback(
    id: string,
    dto: UpdateSellerFeedbackDto,
  ): Promise<SellerFeedback> {
    await this.sellerFeedbackRepository.update(id, dto);
    return this.findOne(id);
  }

  async removeFeedback(id: string): Promise<void> {
    const feedback = await this.findOne(id);
    await this.sellerFeedbackRepository.remove(feedback);
  }
}
