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

  async addToCart(
    userId: string,
    comicId: string,
    quantity: number,
  ): Promise<Cart> {
    // Find the user
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    console.log('user:::::::', user);
    // Find the user's cart or create a new one
    let cart = await this.cartRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['comics'],
    });

    console.log('cart::::::::::', cart);
    if (!cart) {
      cart = this.cartRepository.create({
        user,
        comics: [],
        quantities: {},
        totalPrice: 0,
      });
    }

    // Find the comic
    const comic = await this.comicRepository.findOne({
      where: { id: comicId },
    });
    if (!comic) {
      throw new NotFoundException('Comic not found');
    }

    // Check if the comic is already in the cart
    if (!cart.comics.find((c) => c.id === comicId)) {
      cart.comics.push(comic); // Add the comic to the cart if not already added
    }

    // Update quantity for the comic
    cart.quantities[comicId] = (cart.quantities[comicId] || 0) + quantity; // Increment quantity

    // Recalculate total price
    cart.totalPrice = this.calculateTotalPrice(cart.comics, cart.quantities);

    // Save the updated cart
    return this.cartRepository.save(cart);
  }

  private calculateTotalPrice(
    comics: Comic[],
    quantities: { [comicId: string]: number },
  ): number {
    return comics.reduce((total, comic) => {
      return total + comic.price * (quantities[comic.id] || 1);
    }, 0);
  }

  async removeComicFromCart(cartId: string, comicId: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId }, // Use `where` to search by cartId
      relations: ['comics'], // Load related comics
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Filter out the comic to remove from the cart
    cart.comics = cart.comics.filter((comic) => comic.id !== comicId);
    delete cart.quantities[comicId]; // Remove the quantity for the removed comic

    // Recalculate total price after removing the comic
    cart.totalPrice = this.calculateTotalPrice(cart.comics, cart.quantities);

    // Save the updated cart and return it
    return this.cartRepository.save(cart);
  }

  async getCartByUserId(userId: string): Promise<Cart> {
    return this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['comics'],
    });
  }
}
