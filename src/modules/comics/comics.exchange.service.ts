import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comic } from 'src/entities/comics.entity';
import { Repository } from 'typeorm';
import { ComicsStatusEnum } from './dto/comic-status.enum';

@Injectable()
export class ComicsExchangeService {
  constructor(
    @InjectRepository(Comic)
    private readonly comicRepository: Repository<Comic>,
  ) {}

  async findRequestedExchangeComicsByUser(userId: string) {
    return await this.comicRepository.find({
      where: {
        sellerId: {
          id: userId,
        },
        status: ComicsStatusEnum.EXCHANGE_REQUEST,
      },
      order: {
        title: 'ASC',
      },
    });
  }

  async findOfferedExchangeComicsByUser(userId: string, limited: boolean) {
    return await this.comicRepository.find({
      where: {
        sellerId: {
          id: userId,
        },
        status: ComicsStatusEnum.EXCHANGE_OFFER,
      },
      order: {
        updatedAt: 'DESC',
        title: 'ASC',
      },
      take: limited ? 20 : null,
    });
  }

  async searchExchangeRequestComicsByTitleAndAuthor(key: string) {
    if (key.length === 0) return;

    return await this.comicRepository
      .createQueryBuilder('comics')
      .leftJoinAndSelect('comics.sellerId', 'seller')
      .where(
        'LOWER(comics.title) LIKE :key OR LOWER(comics.author) LIKE :key AND comics.status = :status',
        {
          key: `%${key.toLowerCase()}%`,
          status: ComicsStatusEnum.EXCHANGE_REQUEST,
        },
      )
      .orderBy('comics.sellerId')
      .getMany();
  }
}
