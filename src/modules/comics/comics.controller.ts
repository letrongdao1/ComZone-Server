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
  Patch,
} from '@nestjs/common';
import { ComicService } from './comics.service';
import {
  CreateComicDto,
  UpdateComicDto,
  UpdateComicStatusDto,
} from './dto/comic.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Comic } from 'src/entities/comics.entity';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Roles } from '../authorization/roles.decorator';
import { Role } from '../authorization/role.enum';
import { PermissionsGuard } from '../authorization/permission.guard';
import { CreateExchangeComicsDTO } from './dto/exchange-comics.dto';
import { ComicsExchangeService } from './comics.exchange.service';

@ApiBearerAuth()
@ApiTags('Comics')
@Controller('comics')
export class ComicController {
  constructor(
    private readonly comicService: ComicService,
    private readonly comicsExchangeService: ComicsExchangeService,
  ) {}

  @Roles(Role.SELLER)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createComicDto: CreateComicDto, @Req() req: any) {
    return this.comicService.createComic(createComicDto, req.user.id);
  }

  @Roles(Role.MEMBER, Role.SELLER)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Post('exchange')
  createExchangeOfferComics(
    @Req() req: any,
    @Body() dto: CreateExchangeComicsDTO,
  ) {
    return this.comicsExchangeService.createExchangeComics(req.user.id, dto);
  }

  // @Roles(Role.MODERATOR)
  // @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Get()
  findAllSellComics() {
    return this.comicService.findAllSellComics();
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

  @Roles(Role.SELLER)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Get('search/seller')
  searchSellerComics(@Req() req: any, @Query('search') key: string) {
    return this.comicService.searchSellerComicsByKey(req.user.id, key);
  }

  @UseGuards(JwtAuthGuard)
  @Get('except-seller/:status')
  async findAllExceptSeller(
    @Req() req: any,
    @Param('status') status: string,
  ): Promise<Comic[]> {
    const sellerId = req.user ? req.user.id : null;
    return this.comicService.findAllExceptSeller(sellerId, status);
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: string) {
    return this.comicService.findByStatus(status.toUpperCase());
  }

  @Get('count/status/:status')
  findByStatusAndCount(
    @Param('status') status: string,
    @Query('load') load: string,
  ) {
    return this.comicService.findByStatusAndCount(
      status.toUpperCase(),
      Number(load),
    );
  }

  @Get('sort/price')
  findAllAndSortByPrice(@Query('order') order: 'ASC' | 'DESC' = 'ASC') {
    return this.comicService.findAllAndSortByPrice(order);
  }

  @Get('filter')
  async filterComics(
    @Query('genreIds') genreIds: string,
    @Query('author') author: string,
    @Query('condition') condition: string | null,
  ) {
    const genresArray = genreIds ? genreIds.split(',') : [];
    const authorsArray = author ? author.split(',') : [];
    return await this.comicService.findByGenresAuthorsConditions(
      genresArray,
      authorsArray,
      condition,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/exchange/user')
  getExchangeComicsOfUser(@Req() req: any) {
    return this.comicsExchangeService.getExchangeComicsOfUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/exchange/search/self')
  searchUserExchangeComics(@Req() req: any, @Query('key') key: string) {
    return this.comicsExchangeService.searchUserExchangeComics(
      req.user.id,
      key,
    );
  }

  @Get('/exchange/:user_id')
  findOfferedExchangeComicsByUser(@Param('user_id') userId: string) {
    return this.comicsExchangeService.getExchangeComicsOfUser(userId);
  }

  @Get('/exchange/search/other/:user_id')
  searchOthersExchangeComics(
    @Param('user_id') userId: string,
    @Query('key') key: string,
  ) {
    return this.comicsExchangeService.searchUserExchangeComics(userId, key);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.comicService.findOne(id);
  }
  @Get(':id/stop-sell')
  async stopSelling(@Param('id') id: string) {
    return await this.comicService.stopSelling(id);
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

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateComicStatusDto: UpdateComicStatusDto,
  ) {
    const { status } = updateComicStatusDto;
    return await this.comicService.updateStatus(id, status);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('soft/:id')
  sellerDelete(@Param('id') id: string) {
    return this.comicService.softDelete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('undo/:id')
  undoDelete(@Param('id') id: string) {
    return this.comicService.restore(id);
  }

  @Roles(Role.MODERATOR)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.comicService.remove(id);
  }
}
