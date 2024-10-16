// cart.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../../entities/carts.entity';
import { Comic } from '../../entities/comics.entity';
import { User } from '../../entities/users.entity';
import { CreateCartDto, UpdateCartDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(Comic)
    private comicRepository: Repository<Comic>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async addToCart(userId: string, comicId: string): Promise<Cart> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let cart = await this.cartRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['comics', 'comics.sellerId'],
    });

    if (!cart) {
      cart = this.cartRepository.create({
        user,
        comics: [],
        quantities: {},
        totalPrice: 0,
      });
    }

    // Find the comic with sellerId
    const comic = await this.comicRepository.findOne({
      where: { id: comicId },
      relations: ['sellerId'],
    });
    if (!comic) {
      throw new NotFoundException('Comic not found');
    }

    // Check if the comic is already in the cart
    if (!cart.comics.find((c) => c.id === comicId)) {
      cart.comics.push(comic);
    }

    cart.quantities[comicId] = (cart.quantities[comicId] || 0) + 1;

    cart.totalPrice = this.calculateTotalPrice(cart.comics, cart.quantities);

    const updatedCart = await this.cartRepository.save(cart);

    return await this.cartRepository.findOne({
      where: { id: updatedCart.id },
      relations: ['comics', 'comics.sellerId'],
    });
  }

  private calculateTotalPrice(
    comics: Comic[],
    quantities: { [comicId: string]: number },
  ): number {
    return comics.reduce((total, comic) => {
      return total + comic.price * (quantities[comic.id] || 1);
    }, 0);
  }
  async increaseComicQuantity(
    userId: string,
    comicId: string,
    quantity: number = 1,
  ): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['comics'],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const comic = cart.comics.find((c) => c.id === comicId);
    if (!comic) {
      throw new NotFoundException('Comic not found in cart');
    }

    cart.quantities[comicId] = (cart.quantities[comicId] || 0) + quantity;

    cart.totalPrice = this.calculateTotalPrice(cart.comics, cart.quantities);

    return this.cartRepository.save(cart);
  }
  async decreaseComicQuantity(
    userId: string,
    comicId: string,
    quantity: number = 1,
  ): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['comics'],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const comic = cart.comics.find((c) => c.id === comicId);
    if (!comic) {
      throw new NotFoundException('Comic not found in cart');
    }

    cart.quantities[comicId] = (cart.quantities[comicId] || 0) - quantity;

    if (cart.quantities[comicId] <= 0) {
      cart.comics = cart.comics.filter((c) => c.id !== comicId);
      delete cart.quantities[comicId];
    }

    cart.totalPrice = this.calculateTotalPrice(cart.comics, cart.quantities);

    return this.cartRepository.save(cart);
  }

  async removeComicFromCart(userId: string, comicId: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['comics'],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const comicInCart = cart.comics.find((comic) => comic.id === comicId);
    if (!comicInCart) {
      throw new NotFoundException('Comic not found in cart');
    }

    cart.comics = cart.comics.filter((comic) => comic.id !== comicId);
    delete cart.quantities[comicId];

    cart.totalPrice = this.calculateTotalPrice(cart.comics, cart.quantities);

    return this.cartRepository.save(cart);
  }

  async getCartByUserId(userId: string): Promise<Cart> {
    return this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['comics', 'comics.sellerId'],
    });
  }
}
