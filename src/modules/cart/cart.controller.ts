// cart.controller.ts
import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Delete,
  UseGuards,
  Patch,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';

@ApiBearerAuth()
@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':comicId')
  addToCart(@Req() req: any, @Param('comicId') comicId: string) {
    return this.cartService.addToCart(req.user.id, comicId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  getCart(@Req() req: any) {
    return this.cartService.getCartByUserId(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('comic/:comicId')
  removeComicFromCart(@Req() req: any, @Param('comicId') comicId: string) {
    return this.cartService.removeComicFromCart(req.user.id, comicId);
  }
  @UseGuards(JwtAuthGuard)
  @Patch('increase/:comicId')
  async increaseComicQuantity(
    @Req() req: any,
    @Param('comicId') comicId: string,
  ) {
    return this.cartService.increaseComicQuantity(req.user.id, comicId);
  }
  @UseGuards(JwtAuthGuard)
  @Patch('decrease/:comicId')
  async decreaseComicQuantity(
    @Req() req: any,
    @Param('comicId') comicId: string,
  ) {
    return this.cartService.decreaseComicQuantity(req.user.id, comicId);
  }
}
