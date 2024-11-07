import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ExchangesService } from './exchanges.service';
import {
  AcceptDealingExchangeDTO,
  CreateExchangePostDTO,
  UpdateOfferedComicsDTO,
} from './dto/exchange.dto';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../authorization/roles.decorator';
import { Role } from '../authorization/role.enum';
import { PermissionsGuard } from '../authorization/permission.guard';

@ApiBearerAuth()
@ApiTags('Exchanges')
@Controller('exchanges')
export class ExchangesController {
  constructor(private readonly exchangesService: ExchangesService) {}

  @Get('available/guest')
  getAvailableExchangePostsAsGuest(@Param('user_id') userId: string) {
    return this.exchangesService.getAvailableExchangePosts(userId);
  }

  @Get('search/default/:user_id')
  getSearchedExchanges(
    @Param('user_id') userId: string,
    @Query('key') key: string,
  ) {
    return this.exchangesService.getSearchedExchanges(userId, key);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createExchangePost(
    @Req() req: any,
    @Body() createExchangePostDto: CreateExchangePostDTO,
  ) {
    return this.exchangesService.createExchangePost(
      req.user.id,
      createExchangePostDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('available/logged')
  getAvailableExchangePostsAsLoggedIn(@Req() req: any) {
    return this.exchangesService.getAvailableExchangePosts(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  getAllExchangePostsOfUser(@Req() req: any) {
    return this.exchangesService.getAllExchangePostsOfUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('search/owned')
  getSearchedExchangesByOwned(@Req() req: any, @Query('key') key: string) {
    return this.exchangesService.getSearchExchangesByOwned(req.user.id, key);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/offered')
  getAllExchangeThatUserOffered(@Req() req: any) {
    return this.exchangesService.getAllExchangeThatUserOffered(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('accept-dealing')
  acceptDealingAnExchange(
    @Req() req: any,
    @Body() acceptDealingExchangeDto: AcceptDealingExchangeDTO,
  ) {
    return this.exchangesService.acceptDealingAnExchange(
      req.user.id,
      acceptDealingExchangeDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('offer')
  updateOfferComicsForAnExchange(
    @Body() updateOfferedComicsDto: UpdateOfferedComicsDTO,
  ) {
    return this.exchangesService.updateOfferForAnExchange(
      updateOfferedComicsDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('soft/:id')
  softDeleteExchangePost(@Req() req: any, @Param('id') exchangeId: string) {
    return this.exchangesService.softDeleteExchangePost(
      req.user.id,
      exchangeId,
    );
  }

  @Delete('undo/:id')
  undoDelete(@Param('id') exchangeId: string) {
    return this.exchangesService.undoDelete(exchangeId);
  }

  @Roles(Role.MODERATOR)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') exchangeId: string) {
    return this.exchangesService.remove(exchangeId);
  }
}
