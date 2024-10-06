import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComicService } from './comics.service';
import { ComicController } from './comics.controller';
import { Comic } from 'src/entities/comics.entity';
import { Genre } from 'src/entities/genre.entity';
import { User } from 'src/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comic, Genre, User])],
  controllers: [ComicController],
  providers: [ComicService],
})
export class ComicModule {}
