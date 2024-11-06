import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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

@ApiBearerAuth()
@ApiTags('Exchanges')
@Controller('exchanges')
export class ExchangesController {
  constructor(private readonly exchangesService: ExchangesService) {}

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

  @Get('available')
  getAvailableExchangePosts() {
    return this.exchangesService.getAvailableExchangePosts();
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  getAllExchangePostsOfUser(@Req() req: any) {
    return this.exchangesService.getAllExchangePostsOfUser(req.user.id);
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
  @Delete(':id')
  deleteExchangePost(@Req() req: any, @Param('id') exchangeId: string) {
    return this.exchangesService.deleteExchangePost(req.user.id, exchangeId);
  }

  @Delete('undo/:id')
  undoDelete(@Param('id') exchangeId: string) {
    return this.exchangesService.undoDelete(exchangeId);
  }
}
