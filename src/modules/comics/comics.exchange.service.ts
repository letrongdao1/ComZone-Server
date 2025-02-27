import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comic } from 'src/entities/comics.entity';
import { ILike, Repository } from 'typeorm';
import { ComicsStatusEnum } from './dto/comic-status.enum';
import { BaseService } from 'src/common/service.base';
import { ComicsTypeEnum } from './dto/comic-type.enum';
import { CreateExchangeComicsDTO } from './dto/exchange-comics.dto';
import { User } from 'src/entities/users.entity';
import { ConditionsService } from '../conditions/conditions.service';

@Injectable()
export class ComicsExchangeService extends BaseService<Comic> {
  constructor(
    @InjectRepository(Comic)
    private readonly comicsRepository: Repository<Comic>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly conditionsService: ConditionsService,
  ) {
    super(comicsRepository);
  }

  async getOne(id: string): Promise<Comic> {
    return await this.comicsRepository.findOne({
      where: { id, type: ComicsTypeEnum.EXCHANGE },
    });
  }

  async createExchangeComics(userId: string, dto: CreateExchangeComicsDTO) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User cannot be found!');

    const condition = await this.conditionsService.getConditionByValue(
      dto.condition,
    );

    const newExchangeComics = this.comicsRepository.create({
      sellerId: user,
      ...dto,
      condition,
      type: ComicsTypeEnum.EXCHANGE,
      status: ComicsStatusEnum.AVAILABLE,
    });

    return await this.comicsRepository.save(newExchangeComics);
  }

  async getExchangeComicsOfUser(userId: string) {
    const comicsList = await this.comicsRepository.find({
      where: {
        sellerId: {
          id: userId,
        },
        type: ComicsTypeEnum.EXCHANGE,
      },
    });

    comicsList.sort((a, b) => {
      if (a.status === b.status) return a.updatedAt > b.updatedAt ? -1 : 1;
      else {
        if (a.status === ComicsStatusEnum.AVAILABLE) return -1;
        else if (a.status === ComicsStatusEnum.PRE_ORDER) return 0;
        else return 1;
      }
    });
    return comicsList;
  }

  async getAvailableExchangeComicsOfUser(userId: string) {
    return await this.comicsRepository.find({
      where: {
        sellerId: {
          id: userId,
        },
        type: ComicsTypeEnum.EXCHANGE,
        status: ComicsStatusEnum.AVAILABLE,
      },
      order: {
        updatedAt: 'DESC',
        title: 'ASC',
      },
    });
  }

  async searchUserExchangeComics(userId: string, key: string) {
    return await this.comicsRepository.find({
      where: [
        {
          sellerId: { id: userId },
          type: ComicsTypeEnum.EXCHANGE,
          title: ILike(`%${key}%`),
        },
        {
          sellerId: { id: userId },
          type: ComicsTypeEnum.EXCHANGE,
          author: ILike(`%${key}%`),
        },
      ],
      order: {
        updatedAt: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async searchExchangeRequestComicsByTitleAndAuthor(key: string) {
    if (key.length === 0) return;

    return await this.comicsRepository
      .createQueryBuilder('comics')
      .leftJoinAndSelect('comics.sellerId', 'seller')
      .where(
        'LOWER(comics.title) LIKE :key OR LOWER(comics.author) LIKE :key AND comics.type = :type AND comics.status = :status',
        {
          key: `%${key.toLowerCase()}%`,
          type: ComicsTypeEnum.EXCHANGE,
          status: ComicsStatusEnum.AVAILABLE,
        },
      )
      .orderBy('comics.sellerId')
      .getMany();
  }

  async updateStatus(comicsId: string, status: ComicsStatusEnum) {
    return await this.comicsRepository
      .update(comicsId, {
        status,
      })
      .then(() => this.getOne(comicsId));
  }
}
