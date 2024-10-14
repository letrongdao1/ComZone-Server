import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';

import { CreateComicDto, UpdateComicDto } from './dto/comic.dto';
import { Comic } from 'src/entities/comics.entity';
import { Genre } from 'src/entities/genres.entity';
import { User } from 'src/entities/users.entity';

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

    let seller;
    if (sellerId) {
      seller = await this.userRepository.findOne({
        where: { id: sellerId },
      });
      if (!seller) {
        throw new Error('Seller not found');
      }
    }

    const genres = genreIds
      ? await this.genreRepository.find({
          where: genreIds.map((id) => ({ id })),
        })
      : undefined;

    await this.comicRepository.update(id, {
      ...comicData,
      sellerId: seller,
      genres,
    });

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
}
