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
        status: ComicsStatusEnum.EXCHANGE,
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

  async searchExchangeOfferComicsByTitleAndAuthor(key: string) {
    return await this.comicRepository
      .createQueryBuilder('comics')
      .leftJoinAndSelect('comics.sellerId', 'seller')
      .where('LOWER(comics.title) LIKE :key', {
        key: `%${key.toLowerCase()}%`,
      })
      .orWhere('LOWER(comics.author) LIKE :key', {
        key: `%${key.toLowerCase()}%`,
      })
      .andWhere('comics.status = :status', {
        status: ComicsStatusEnum.EXCHANGE_OFFER,
      })
      .orderBy('comics.sellerId')
      .getMany();
  }

  async searchExchangeOfferComicsByDescription(key: string) {
    return await this.comicRepository
      .createQueryBuilder('comics')
      .leftJoinAndSelect('comics.sellerId', 'seller')
      .where('LOWER(comics.description) LIKE :key', {
        key: `%${key.toLowerCase()}%`,
      })
      .andWhere('comics.status = :status', {
        status: ComicsStatusEnum.EXCHANGE_OFFER,
      })
      .orderBy('comics.sellerId')
      .getMany();
  }

  async searchExchangeRequestComicsByTitleAndAuthor(key: string) {
    return await this.comicRepository
      .createQueryBuilder('comics')
      .leftJoinAndSelect('comics.sellerId', 'seller')
      .where('LOWER(comics.title) LIKE :key', {
        key: `%${key.toLowerCase()}%`,
      })
      .orWhere('LOWER(comics.author) LIKE :key', {
        key: `%${key.toLowerCase()}%`,
      })
      .andWhere('comics.status = :status', {
        status: ComicsStatusEnum.EXCHANGE,
      })
      .orderBy('comics.sellerId')
      .getMany();
  }
}
