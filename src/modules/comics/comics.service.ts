import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
    @InjectRepository(User) // Injecting UserRepository to handle sellerId
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createComicDto: CreateComicDto): Promise<Comic> {
    const { genreIds, sellerId, ...comicData } = createComicDto;

    // Fetch the seller (User entity) using sellerId
    const seller = await this.userRepository.findOne({
      where: { id: sellerId },
    });
    if (!seller) {
      throw new Error('Seller not found');
    }

    // Fetch genres using `find` with `where` clause
    const genres = await this.genreRepository.find({
      where: genreIds.map((id) => ({ id })),
    });

    // Create the comic entity and assign the seller and genres
    const comic = this.comicRepository.create({
      ...comicData,
      sellerId: seller, // Assign the fetched seller (User entity)
      genres,           // Assign the fetched genres
    });

    return await this.comicRepository.save(comic);
  }

  async findAll(): Promise<Comic[]> {
    return await this.comicRepository.find({ relations: ['genres', 'sellerId'] });
  }

  async findOne(id: string): Promise<Comic> {
    return await this.comicRepository.findOne({
      where: { id },
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

    // Update the comic, ensuring relations are updated too
    await this.comicRepository.update(id, {
      ...comicData,
      sellerId: seller, // Update seller if provided
      genres,
    });

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.comicRepository.delete(id);
  }
}
