// src/modules/genre/genre.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGenreDto, UpdateGenreDto } from './dto/genre.dto';
import { Genre } from 'src/entities/genres.entity';

@Injectable()
export class GenreService {
  constructor(
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  async create(createGenreDto: CreateGenreDto): Promise<Genre> {
    const genre = this.genreRepository.create(createGenreDto);
    return await this.genreRepository.save(genre);
  }

  async findAll(): Promise<Genre[]> {
    return await this.genreRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Genre> {
    const genre = await this.genreRepository.findOne({ where: { id } });
    if (!genre) {
      throw new Error('Genre not found');
    }
    return genre;
  }

  async update(id: string, updateGenreDto: UpdateGenreDto): Promise<Genre> {
    await this.genreRepository.update(id, updateGenreDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.genreRepository.delete(id);
  }
}
