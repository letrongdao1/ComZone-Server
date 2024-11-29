import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, In, Not, Repository } from 'typeorm';

import { CreateComicDto, UpdateComicDto } from './dto/comic.dto';
import { Comic } from 'src/entities/comics.entity';
import { Genre } from 'src/entities/genres.entity';
import { User } from 'src/entities/users.entity';
import { ComicsStatusEnum } from './dto/comic-status.enum';
import { ComicsTypeEnum } from './dto/comic-type.enum';
import { SellerDetailsService } from '../seller-details/seller-details.service';

@Injectable()
export class ComicService {
  constructor(
    @InjectRepository(Comic)
    private readonly comicRepository: Repository<Comic>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly sellerDetailsService: SellerDetailsService,
  ) {}

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

  async create(createComicDto: CreateComicDto, id: string): Promise<Comic> {
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

  async findByStatus(status: string): Promise<Comic[]> {
    return await this.comicRepository.find({
      where: { type: ComicsTypeEnum.SELL, status },
      relations: ['genres', 'sellerId'],
    });
  }

  async findByStatusAndCount(
    status: string,
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

  async findBySeller(sellerId: string): Promise<Comic[]> {
    const seller = await this.userRepository.findOne({
      where: { id: sellerId },
    });

    if (!seller) {
      throw new Error('Seller not found');
    }

    // Modify the find query to sort by createdAt in descending order
    const comics = await this.comicRepository.find({
      where: {
        sellerId: { id: seller.id },
        type: In([
          ComicsTypeEnum.SELL,
          ComicsTypeEnum.AUCTION,
          ComicsTypeEnum.NONE,
        ]),
      },
      order: {
        status: 'ASC',
        createdAt: 'DESC',
      },
    });

    return comics;
  }

  async findAllExceptSeller(
    sellerId: string | null,
    status: string,
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
    return this.comicRepository
      .createQueryBuilder('comic')
      .leftJoin('comic.genres', 'genre')
      .where('genre.id IN (:...genreIds)', { genreIds })
      .andWhere('comic.type = :type', { type: ComicsTypeEnum.SELL })
      .groupBy('comic.id')
      .having('COUNT(genre.id) >= :genreCount', { genreCount: genreIds.length }) // Match at least the provided genres
      .getMany();
  }
  async findByAuthor(author: string): Promise<Comic[]> {
    return this.comicRepository
      .createQueryBuilder('comic')
      .where('comic.author = :author', { author })
      .andWhere('comic.type = :type', { type: ComicsTypeEnum.SELL })
      .getMany();
  }

  async updateStatus(
    comicsId: string,
    status: ComicsStatusEnum,
  ): Promise<Comic> {
    // Check if the comic exists
    const comic = await this.comicRepository.findOne({
      where: { id: comicsId },
    });

    if (!comic) {
      throw new NotFoundException('Comic not found');
    }

    if (status === ComicsStatusEnum.AVAILABLE) {
      await this.checkSellerAvailability(comic.sellerId.id);

      await this.comicRepository.update(comicsId, {
        onSaleSince: new Date(),
      });
    }
    comic.status = status;
    comic.type = ComicsTypeEnum.SELL;
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

    comic.status = ComicsStatusEnum.UNAVAILABLE;
    comic.type = ComicsTypeEnum.NONE;
    await this.comicRepository.save(comic);

    console.log(comic);

    return comic;
  }
}
