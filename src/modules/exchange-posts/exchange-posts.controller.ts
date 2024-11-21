import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ExchangePostsService } from './exchange-posts.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { CreateExchangePostDTO } from './dto/post.dto';

@ApiBearerAuth()
@ApiTags('Exchange posts')
@Controller('exchange-posts')
export class ExchangePostsController {
  constructor(private readonly exchangePostsService: ExchangePostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createNewPost(@Req() req: any, @Body() dto: CreateExchangePostDTO) {
    return this.exchangePostsService.createNewPost(req.user.id, dto);
  }

  @Get('available')
  getAvailablePosts() {
    return this.exchangePostsService.getAvailablePosts();
  }

  @UseGuards(JwtAuthGuard)
  @Get('available/user')
  getAvailablePostsLoggedIn(@Req() req: any) {
    return this.exchangePostsService.getAvailablePosts(req.user.id);
  }

  @Get('search')
  getSearchedPosts(@Query('key') key: string) {
    return this.exchangePostsService.getSearchedPosts(key);
  }

  @Get('short/some')
  getSomeShortPosts() {
    return this.exchangePostsService.getSomeShortPosts();
  }
}
