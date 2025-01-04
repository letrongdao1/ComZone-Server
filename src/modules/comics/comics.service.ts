import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, ILike, In, IsNull, Not, Repository } from 'typeorm';

import { CreateComicDto, UpdateComicDto } from './dto/comic.dto';
import { Comic } from 'src/entities/comics.entity';
import { Genre } from 'src/entities/genres.entity';
import { User } from 'src/entities/users.entity';
import { ComicsStatusEnum } from './dto/comic-status.enum';
import { ComicsTypeEnum } from './dto/comic-type.enum';
import { SellerDetailsService } from '../seller-details/seller-details.service';
import { BaseService } from 'src/common/service.base';
import { Auction } from 'src/entities/auction.entity';
import { Role } from '../authorization/role.enum';

@Injectable()
export class ComicService extends BaseService<Comic> {
  constructor(
    @InjectRepository(Comic)
    private readonly comicRepository: Repository<Comic>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Auction)
    private readonly auctionsRepository: Repository<Auction>,

    private readonly sellerDetailsService: SellerDetailsService,
  ) {
    super(comicRepository);
  }

  async checkSellerAvailability(userId: string) {
    const sellerDetails = await this.sellerDetailsService.getByUserId(userId);
    if (!sellerDetails)
      throw new NotFoundException(
        'No seller information found on this account!',
      );

    if (sellerDetails.status === 'DISABLED')
      throw new ForbiddenException(
        'This sellers account is currently disabled from creating and selling comics due to remaining debts!',
      );

    return;
  }

  async createComic(
    createComicDto: CreateComicDto,
    id: string,
  ): Promise<Comic> {
    const { genreIds, ...comicData } = createComicDto;

    const seller = await this.userRepository.findOne({
      where: { id: id },
    });

    if (!seller) {
      throw new Error('Seller not found');
    }

    await this.checkSellerAvailability(id);

    const genres = await this.genreRepository.find({
      where: genreIds.map((id) => ({ id })),
    });

    const comic = this.comicRepository.create({
      ...comicData,
      sellerId: seller,
      genres,
    });

    return await this.comicRepository.save(comic);
  }

  async findAllSellComics(): Promise<Comic[]> {
    return await this.comicRepository.find({
      where: { type: ComicsTypeEnum.SELL },
      relations: ['genres', 'sellerId'],
    });
  }

  async findOne(id: string): Promise<Comic> {
    return await this.comicRepository.findOne({
      where: { id },
      relations: ['genres', 'sellerId'],
    });
  }

  async findByStatus(status: ComicsStatusEnum): Promise<Comic[]> {
    return await this.comicRepository.find({
      where: { type: ComicsTypeEnum.SELL, status },
      relations: ['genres', 'sellerId'],
    });
  }

  async findByStatusAndCount(
    status: ComicsStatusEnum,
    load?: number,
  ): Promise<[Comic[], number]> {
    return await this.comicRepository.findAndCount({
      where: { type: ComicsTypeEnum.SELL, status },
      relations: ['genres', 'sellerId'],
      take: load || 999999999999,
    });
  }

  async update(id: string, updateComicDto: UpdateComicDto): Promise<Comic> {
    const { genreIds, ...comicData } = updateComicDto;

    // Fetch the existing comic entity
    const comic = await this.comicRepository.findOne({
      where: { id },
      relations: ['genres'], // Ensure to load the existing genres
    });

    if (!comic) {
      throw new Error('Comic not found');
    }

    // Retrieve the seller if sellerId is provided
    // if (sellerId) {
    //   const seller = await this.userRepository.findOne({
    //     where: { id: sellerId },
    //   });
    //   if (!seller) {
    //     throw new Error('Seller not found');
    //   }
    //   comic.sellerId = seller; // Assign the seller entity
    // }

    // Retrieve genres based on provided genreIds
    if (genreIds) {
      const genres = await this.genreRepository.find({
        where: genreIds.map((id) => ({ id })),
      });
      comic.genres = genres; // Assign the retrieved genres
    }
    Object.assign(comic, comicData);

    await this.comicRepository.save(comic);

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.comicRepository.delete(id);
  }

  async getSomeAvailableComics() {
    return await this.comicRepository
      .createQueryBuilder('comics')
      .where('comics.type = :type AND comics.status = :status', {
        type: ComicsTypeEnum.SELL,
        status: ComicsStatusEnum.AVAILABLE,
      })
      .orderBy('RAND()')
      .take(10)
      .getMany();
  }

  async findBySeller(sellerId: string): Promise<Comic[]> {
    const seller = await this.userRepository.findOne({
      where: { id: sellerId },
    });

    if (!seller) {
      throw new Error('Seller not found');
    }

    const comics = await this.comicRepository.find({
      where: {
        sellerId: { id: seller.id },
        type: In([
          ComicsTypeEnum.SELL,
          ComicsTypeEnum.AUCTION,
          ComicsTypeEnum.NONE,
        ]),
      },
    });

    //UNAVAILABLE COMICS GO FIRST
    comics.sort((a, b) => {
      const statusOrder = [
        ComicsStatusEnum.UNAVAILABLE,
        ComicsStatusEnum.PRE_ORDER,
        ComicsStatusEnum.AVAILABLE,
        ComicsStatusEnum.SOLD,
      ];

      if (a.status !== b.status) {
        return (
          statusOrder.findIndex((value) => value === a.status) -
          statusOrder.findIndex((value) => value === b.status)
        );
      } else {
        if (
          a.type === b.type ||
          (a.type !== ComicsTypeEnum.NONE && b.type !== ComicsTypeEnum.NONE)
        ) {
          return new Date(a.updatedAt) < new Date(b.updatedAt) ? 1 : -1;
        } else {
          return a.type === ComicsTypeEnum.NONE ? -1 : 1;
        }
      }
    });

    return comics;
  }

  async getAllAvailableBySeller(sellerId: string): Promise<Comic[]> {
    const seller = await this.userRepository.findOne({
      where: { id: sellerId },
    });

    if (!seller) {
      throw new Error('Seller not found');
    }

    return await this.comicRepository.find({
      where: {
        sellerId: { id: seller.id },
        type: ComicsTypeEnum.SELL,
        status: ComicsStatusEnum.AVAILABLE,
      },
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  async getSellerComicsData(sellerId: string) {
    const seller = await this.userRepository.findOne({
      where: { id: sellerId },
    });

    if (!seller) {
      throw new Error('Seller not found');
    }

    const comics = await this.comicRepository.find({
      where: {
        sellerId: { id: seller.id },
        type: In([
          ComicsTypeEnum.SELL,
          ComicsTypeEnum.AUCTION,
          ComicsTypeEnum.NONE,
        ]),
      },
    });

    const countAvailable = await this.comicRepository.count({
      where: {
        sellerId: { id: seller.id },
        type: In([ComicsTypeEnum.SELL, ComicsTypeEnum.AUCTION]),
        status: ComicsStatusEnum.AVAILABLE,
      },
    });

    return {
      comics,
      total: comics.length,
      totalAvailable: countAvailable,
    };
  }

  async searchSellerAvailableComicsByKey(sellerId: string, key: string) {
    return await this.comicRepository.find({
      where: [
        {
          sellerId: { id: sellerId },
          type: In([
            ComicsTypeEnum.SELL,
            ComicsTypeEnum.AUCTION,
            ComicsTypeEnum.NONE,
          ]),
          title: ILike(`%${key}%`),
          status: ComicsStatusEnum.AVAILABLE,
        },
        {
          sellerId: { id: sellerId },
          type: In([
            ComicsTypeEnum.SELL,
            ComicsTypeEnum.AUCTION,
            ComicsTypeEnum.NONE,
          ]),
          author: ILike(`%${key}%`),
          status: ComicsStatusEnum.AVAILABLE,
        },
      ],
      order: {
        updatedAt: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async searchSellerComicsByKey(sellerId: string, key: string) {
    return await this.comicRepository.find({
      where: [
        {
          sellerId: { id: sellerId },
          type: In([
            ComicsTypeEnum.SELL,
            ComicsTypeEnum.AUCTION,
            ComicsTypeEnum.NONE,
          ]),
          title: ILike(`%${key}%`),
        },
        {
          sellerId: { id: sellerId },
          type: In([
            ComicsTypeEnum.SELL,
            ComicsTypeEnum.AUCTION,
            ComicsTypeEnum.NONE,
          ]),
          author: ILike(`%${key}%`),
        },
      ],
      order: {
        updatedAt: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async findAllExceptSeller(
    sellerId: string | null,
    status: ComicsStatusEnum,
  ): Promise<Comic[]> {
    if (sellerId) {
      // Exclude comics of the specified seller
      return this.comicRepository.find({
        where: { sellerId: Not(sellerId), type: ComicsTypeEnum.SELL, status },
        relations: ['genres', 'sellerId'],
      });
    } else {
      // Return all comics with the specified status
      return this.comicRepository.find({
        where: { status, type: ComicsTypeEnum.SELL },
        relations: ['genres', 'sellerId'],
      });
    }
  }

  async findOneWithGenres(id: string): Promise<Comic> {
    return await this.comicRepository.findOne({
      where: { id },
      relations: ['genres'], // Include genres relation
    });
  }

  async findAllAndSortByPrice(order: 'ASC' | 'DESC' = 'ASC'): Promise<Comic[]> {
    const options: FindManyOptions<Comic> = {
      where: {
        type: ComicsTypeEnum.SELL,
      },
      order: {
        price: order,
      },
      relations: ['genres', 'sellerId'],
    };

    return await this.comicRepository.find(options);
  }
  async findByGenresAndAuthor(
    genreIds: string[],
    author: string,
  ): Promise<Comic[]> {
    return this.comicRepository
      .createQueryBuilder('comic')
      .leftJoin('comic.genres', 'genre')
      .where('genre.id IN (:...genreIds)', { genreIds }) // Filter by genre IDs
      .andWhere('comic.author = :author', { author }) // Filter by author
      .andWhere('comic.type = :type', { type: ComicsTypeEnum.SELL })
      .groupBy('comic.id')
      .having('COUNT(genre.id) >= :genreCount', { genreCount: genreIds.length }) // Check for at least the provided genres
      .getMany();
  }

  async findByGenres(genreIds: string[]): Promise<Comic[]> {
    console.log(genreIds);

    return this.comicRepository
      .createQueryBuilder('comic')
      .leftJoin('comic.genres', 'genre')
      .where('genre.id IN (:...genreIds)', { genreIds })
      .andWhere('comic.type = :type', { type: ComicsTypeEnum.SELL })
      .groupBy('comic.id') // Group by comic ID to aggregate matching genres
      .having('COUNT(genre.id) = :genreCount', { genreCount: genreIds.length })
      .getMany();
  }

  async findByAuthor(author: string): Promise<Comic[]> {
    return this.comicRepository
      .createQueryBuilder('comic')
      .where('comic.author = :author', { author })
      .andWhere('comic.type = :type', { type: ComicsTypeEnum.SELL })
      .getMany();
  }

  async findByGenresAuthorsConditions(
    genreIds: string[],
    authors: string[],
    condition: string | null,
  ): Promise<Comic[]> {
    console.log(condition);

    const query = this.comicRepository
      .createQueryBuilder('comic')
      .leftJoin('comic.genres', 'genre')
      .select([
        'comic', // Select comic fields
        'genre', // Select genre fields
      ])
      .where('comic.type = :type', { type: ComicsTypeEnum.SELL });

    if (genreIds.length > 0) {
      query
        .andWhere('genre.id IN (:...genreIds)', { genreIds })
        .groupBy('comic.id')
        .having('COUNT(genre.id) >= :genreCount', {
          genreCount: genreIds.length,
        });
    }

    if (authors.length > 0) {
      query.andWhere('comic.author IN (:...authors)', { authors });
    }

    if (condition) {
      if (condition === 'SEALED') {
        query.andWhere('comic.condition = :condition', { condition: 'SEALED' });
      } else if (condition === 'USED') {
        query.andWhere('comic.condition = :condition', { condition: 'USED' });
      } else if (condition === 'ALL') {
      }
    }

    return query.getMany();
  }

  async searchAll(key: string) {
    const comicsResult = await this.comicRepository.find({
      where: [
        {
          title: ILike(`%${key}%`),
          status: ComicsStatusEnum.AVAILABLE,
          type: ComicsTypeEnum.SELL,
          onSaleSince: Not(IsNull()),
        },
        {
          author: ILike(`%${key}%`),
          status: ComicsStatusEnum.AVAILABLE,
          type: ComicsTypeEnum.SELL,
          onSaleSince: Not(IsNull()),
        },
        {
          description: ILike(`%${key}%`),
          status: ComicsStatusEnum.AVAILABLE,
          type: ComicsTypeEnum.SELL,
          onSaleSince: Not(IsNull()),
        },
      ],
      take: 20,
      order: {
        updatedAt: 'DESC',
      },
    });

    console.log('comicsResult: ', comicsResult);

    const sellersResult = await this.userRepository.find({
      where: { name: ILike(`%${key}%`), role: Role.SELLER },
      take: 10,
      order: { last_active: 'DESC' },
    });

    const bindComicsToSeller = await Promise.all(
      sellersResult.map(async (seller) => {
        const sellerComicsList = await this.comicRepository.find({
          where: {
            sellerId: { id: seller.id },
            type: ComicsTypeEnum.SELL,
            status: ComicsStatusEnum.AVAILABLE,
          },
          take: 5,
        });

        return {
          seller,
          comics: sellerComicsList,
        };
      }),
    );

    const auctionsResult = await this.auctionsRepository.find({
      where: {
        comics: {
          title: ILike(`%${key}%`),
          type: ComicsTypeEnum.AUCTION,
          status: ComicsStatusEnum.AVAILABLE,
        },
      },
      take: 20,
    });

    return {
      comics: comicsResult,
      sellers: bindComicsToSeller,
      auctions: auctionsResult,
    };
  }

  async updateStatus(
    comicsId: string,
    status: ComicsStatusEnum,
  ): Promise<Comic> {
    const comic = await this.comicRepository.findOne({
      where: { id: comicsId },
    });

    if (!comic) {
      throw new NotFoundException('Comic not found');
    }

    // if (
    //   status === ComicsStatusEnum.AVAILABLE ||
    //   comic.type !== ComicsTypeEnum.EXCHANGE
    // ) {
    //   await this.checkSellerAvailability(comic.sellerId.id);

    //   await this.comicRepository.update(comicsId, {
    //     onSaleSince: new Date(),
    //   });
    // }

    comic.status = status;

    if (
      status === ComicsStatusEnum.AVAILABLE &&
      comic.type !== ComicsTypeEnum.EXCHANGE
    )
      comic.onSaleSince = new Date(Date.now());

    await this.comicRepository.save(comic);

    return comic;
  }
  async startSelling(
    comicsId: string,
    status: ComicsStatusEnum,
  ): Promise<Comic> {
    const comic = await this.comicRepository.findOne({
      where: { id: comicsId },
    });

    if (!comic) {
      throw new NotFoundException('Comic not found');
    }

    comic.onSaleSince = new Date(Date.now());

    comic.status = status;
    comic.type = ComicsTypeEnum.SELL;

    if (status === ComicsStatusEnum.AVAILABLE)
      await this.comicRepository.save(comic);

    return comic;
  }
  async stopSelling(comicsId: string): Promise<Comic> {
    // Check if the comic exists
    const comic = await this.comicRepository.findOne({
      where: { id: comicsId },
    });

    if (!comic) {
      throw new NotFoundException('Comic not found');
    }

    return await this.comicRepository
      .update(comicsId, {
        status: ComicsStatusEnum.UNAVAILABLE,
        type: ComicsTypeEnum.NONE,
        onSaleSince: null,
      })
      .then(() => this.getOne(comicsId));
  }
}
