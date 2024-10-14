import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { ComicService } from './comics.service';
import { CreateComicDto, UpdateComicDto } from './dto/comic.dto';
import { ApiTags } from '@nestjs/swagger';
import { Comic } from 'src/entities/comics.entity';

@ApiTags('Comics')
@Controller('comics')
export class ComicController {
  constructor(private readonly comicService: ComicService) {}

  @Post()
  create(@Body() createComicDto: CreateComicDto) {
    return this.comicService.create(createComicDto);
  }

  @Get()
  findAll() {
    return this.comicService.findAll();
  }
  @Get('seller/:sellerId')
  async findBySeller(@Param('sellerId') sellerId: string): Promise<Comic[]> {
    return this.comicService.findBySeller(sellerId);
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: string) {
    return this.comicService.findByStatus(status);
  }
  @Get('sort/price')
  findAllAndSortByPrice(@Query('order') order: 'ASC' | 'DESC' = 'ASC') {
    return this.comicService.findAllAndSortByPrice(order);
  }

  @Get('filter')
  async findByGenresAndOrAuthor(
    @Query('genreIds') genreIds: string,
    @Query('author') author?: string,
  ) {
    console.log('Genre IDs: ', genreIds);
    console.log('11111111111111111111111111');
    let genreIdArray: string[] = [];

    if (genreIds) {
      genreIdArray = genreIds.split(',');
    }

    if (genreIdArray.length > 0 && author) {
      // If both genres and author are provided
      return this.comicService.findByGenresAndAuthor(genreIdArray, author);
    } else if (genreIdArray.length > 0) {
      // If only genres are provided
      return this.comicService.findByGenres(genreIdArray);
    } else if (author) {
      // If only author is provided
      return this.comicService.findByAuthor(author);
    } else {
      // Handle case where no filters are provided (e.g., return all comics)
      return this.comicService.findAll();
    }
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.comicService.findOne(id);
  }
  @Get(':id/genres')
  async findComicWithGenres(@Param('id') id: string) {
    return this.comicService.findOneWithGenres(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateComicDto: UpdateComicDto) {
    return this.comicService.update(id, updateComicDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.comicService.remove(id);
  }
}
