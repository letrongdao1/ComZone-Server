import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ComicService } from './comics.service';
import { CreateComicDto, UpdateComicDto } from './dto/comic.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Comic } from 'src/entities/comics.entity';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Roles } from '../authorization/roles.decorator';
import { Role } from '../authorization/role.enum';
import { PermissionsGuard } from '../authorization/permission.guard';
import { ExchangeComicsDTO } from './dto/exchange-comics.dto';
import { ComicsStatusEnum } from './dto/comic-status.enum';

@ApiBearerAuth()
@ApiTags('Comics')
@Controller('comics')
export class ComicController {
  constructor(private readonly comicService: ComicService) {}

  @Roles(Role.SELLER)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createComicDto: CreateComicDto, @Req() req: any) {
    return this.comicService.create(createComicDto, req.user.id);
  }

  @Roles(Role.MEMBER, Role.SELLER)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Post('exchange-offer')
  createExchangeOfferComics(
    @Req() req: any,
    @Body() exchangeComicsDto: ExchangeComicsDTO,
  ) {
    return this.comicService.createExchangeComics(
      req.user.id,
      exchangeComicsDto,
      ComicsStatusEnum.EXCHANGE_OFFER,
    );
  }

  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.comicService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('seller')
  async findBySeller(@Req() req: any): Promise<Comic[]> {
    return this.comicService.findBySeller(req.user.id);
  }

  @Get('seller/:seller_id')
  async findBySellerId(@Param('seller_id') sellerId: string): Promise<Comic[]> {
    return this.comicService.findBySeller(sellerId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('except-seller/:status')
  async findAllExceptSeller(
    @Req() req: any,
    @Param('status') status: string,
  ): Promise<Comic[]> {
    const sellerId = req.user ? req.user.id : null;
    console.log('........', sellerId);
    return this.comicService.findAllExceptSeller(sellerId, status);
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

  @Get('/exchange-offer/:user_id')
  findOfferedExchangeComicsByUser(@Param('user_id') userId: string) {
    return this.comicService.findOfferedExchangeComicsByUser(userId, false);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.comicService.findOne(id);
  }

  @Get(':id/genres')
  async findComicWithGenres(@Param('id') id: string) {
    return this.comicService.findOneWithGenres(id);
  }

  @Roles(Role.MEMBER, Role.SELLER, Role.MODERATOR)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateComicDto: UpdateComicDto) {
    return this.comicService.update(id, updateComicDto);
  }

  @Roles(Role.MODERATOR)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.comicService.remove(id);
  }
}
