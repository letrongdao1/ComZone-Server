import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Not, Repository } from 'typeorm';

import { CreateComicDto, UpdateComicDto } from './dto/comic.dto';
import { Comic } from 'src/entities/comics.entity';
import { Genre } from 'src/entities/genres.entity';
import { User } from 'src/entities/users.entity';
import { ComicsStatusEnum } from './dto/comic-status.enum';

@Injectable()
export class ComicService {
  constructor(
    @InjectRepository(Comic)
    private readonly comicRepository: Repository<Comic>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createComicDto: CreateComicDto): Promise<Comic> {
    const { genreIds, sellerId, ...comicData } = createComicDto;

    const seller = await this.userRepository.findOne({
      where: { id: sellerId },
    });
    if (!seller) {
      throw new Error('Seller not found');
    }

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

  async findAll(): Promise<Comic[]> {
    return await this.comicRepository.find({
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
      where: { status },
      relations: ['genres', 'sellerId'],
    });
  }

  async update(id: string, updateComicDto: UpdateComicDto): Promise<Comic> {
    const { genreIds, sellerId, ...comicData } = updateComicDto;

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

    const comics = await this.comicRepository.find({
      where: { sellerId: { id: seller.id } },
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
        where: { sellerId: Not(sellerId), status },
        relations: ['genres', 'sellerId'],
      });
    } else {
      // Return all comics with the specified status
      return this.comicRepository.find({
        where: { status },
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
      .groupBy('comic.id')
      .having('COUNT(genre.id) >= :genreCount', { genreCount: genreIds.length }) // Check for at least the provided genres
      .getMany();
  }

  async findByGenres(genreIds: string[]): Promise<Comic[]> {
    return this.comicRepository
      .createQueryBuilder('comic')
      .leftJoin('comic.genres', 'genre')
      .where('genre.id IN (:...genreIds)', { genreIds })
      .groupBy('comic.id')
      .having('COUNT(genre.id) >= :genreCount', { genreCount: genreIds.length }) // Match at least the provided genres
      .getMany();
  }
  async findByAuthor(author: string): Promise<Comic[]> {
    return this.comicRepository
      .createQueryBuilder('comic')
      .where('comic.author = :author', { author })
      .getMany();
  }
  // async updateStatus(
  //   id: string,
  //   updateComicStatusDto: UpdateComicStatusDto,
  // ): Promise<Comic> {
  //   const { status } = updateComicStatusDto;

  //   const comic = await this.comicRepository.findOne({
  //     where: { id },
  //   });

  //   if (!comic) {
  //     throw new Error('Comic not found');
  //   }

  //   comic.status = status;
  //   return await this.comicRepository.save(comic);
  // }

  async updateStatus(comicsId: string, status: ComicsStatusEnum) {
    const comics = await this.findOne(comicsId);

    if (!comics) throw new NotFoundException('Comics cannot be found!');

    return await this.comicRepository
      .update(comicsId, {
        status,
      })
      .then(() => this.findOne(comicsId));
  }
}
