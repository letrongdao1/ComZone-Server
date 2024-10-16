// cart.controller.ts
import { Controller, Post, Body, Param, Get, Delete, Patch } from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post(':userId/:comicId')
  addToCart(
    @Param('userId') userId: string,
    @Param('comicId') comicId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.addToCart(userId, comicId, quantity);
  }

  @Get(':userId')
  getCart(@Param('userId') userId: string) {
    return this.cartService.getCartByUserId(userId);
  }

  @Delete(':cartId/comic/:comicId')
  removeComicFromCart(
    @Param('cartId') cartId: string,
    @Param('comicId') comicId: string,
  ) {
    return this.cartService.removeComicFromCart(cartId, comicId);
  }
  @Patch(':userId/increase/:comicId')
  async increaseComicQuantity(
    @Param('userId') userId: string,
    @Param('comicId') comicId: string,
  ) {
    return this.cartService.increaseComicQuantity(userId, comicId);
  }

  @Patch(':userId/decrease/:comicId')
  async decreaseComicQuantity(
    @Param('userId') userId: string,
    @Param('comicId') comicId: string,
  ) {
    return this.cartService.decreaseComicQuantity(userId, comicId);
  }
}
