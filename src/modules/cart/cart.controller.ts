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
  @Get(':userId')
  getCart(@Req() req: any) {
    return this.cartService.getCartByUserId(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
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
