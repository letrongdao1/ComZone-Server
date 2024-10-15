// cart.controller.ts
import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Delete,
  UseGuards,
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
  @Post(':userId/:comicId')
  addToCart(
    @Param('userId') userId: string,
    @Param('comicId') comicId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.addToCart(userId, comicId, quantity);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  getCart(@Param('userId') userId: string) {
    return this.cartService.getCartByUserId(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':cartId/comic/:comicId')
  removeComicFromCart(
    @Param('cartId') cartId: string,
    @Param('comicId') comicId: string,
  ) {
    return this.cartService.removeComicFromCart(cartId, comicId);
  }
}
