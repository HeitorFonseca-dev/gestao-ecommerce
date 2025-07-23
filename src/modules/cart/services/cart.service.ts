import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../../product/entities/product.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { AddToCartDTO } from '../dto/cart.dto';
import { CartItem } from '../entities/cart-items.entity';
import { Cart } from '../entities/cart.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,

    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,

    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
  ) {}

  async getOrCreateCart(user: UserEntity): Promise<Cart> {
    let cart = await this.cartRepository.findOne({ where: { user } });
    if (!cart) {
      cart = this.cartRepository.create({ user, items: [] });
      await this.cartRepository.save(cart);
    }
    return cart;
  }

  async addToCart(user: UserEntity, dto: AddToCartDTO) {
    const cart = await this.getOrCreateCart(user);
    const product = await this.productRepository.findOneByOrFail({
      id: dto.productId,
    });

    const existingItem = cart.items.find(i => i.product.id === dto.productId);
    if (existingItem) {
      existingItem.quantity += dto.quantity;
      await this.cartItemRepository.save(existingItem);
    } else {
      const newItem = this.cartItemRepository.create({
        cart,
        product,
        quantity: dto.quantity,
      });
      await this.cartItemRepository.save(newItem);
    }

    return this.cartRepository.findOneOrFail({ where: { id: cart.id } });
  }

  async removeItem(user: UserEntity, productId: string) {
    const cart = await this.getOrCreateCart(user);
    const item = cart.items.find(i => i.product.id === productId);

    if (!item) throw new NotFoundException('Item not found in cart');

    await this.cartItemRepository.remove(item);
    return this.getOrCreateCart(user);
  }

  async updateQuantity(user: UserEntity, dto: AddToCartDTO) {
    const cart = await this.getOrCreateCart(user);
    const item = cart.items.find(i => i.product.id === dto.productId);

    if (!item) throw new NotFoundException('Item not found in cart');

    item.quantity = dto.quantity;
    await this.cartItemRepository.save(item);

    return cart;
  }

  async clearCart(user: UserEntity) {
    const cart = await this.getOrCreateCart(user);
    await this.cartItemRepository.delete({ cart });
    return this.getOrCreateCart(user);
  }

  async getCart(user: UserEntity) {
    return this.getOrCreateCart(user);
  }
}
