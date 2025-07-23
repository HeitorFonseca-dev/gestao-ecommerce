import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../../../redis/services/redis.service';
import { OrderEntity } from '../../order/entities/order.entity';
import { OrderItemsEntity } from '../../order/order-items/entities/order-items.entity';
import { ProductEntity } from '../../product/entities/product.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { CartItemEntity } from '../entities/cart-items.entity';
import { CartEntity } from '../entities/cart.entity';
import Redis from 'ioredis';
import { OrderStatus } from '../../order/enum/order-status.enum';

@Injectable()
export class CartService {
  private client: Redis;

  constructor(
    @InjectRepository(CartEntity)
    private cartRepository: Repository<CartEntity>,

    @InjectRepository(CartItemEntity)
    private cartItemRepository: Repository<CartItemEntity>,

    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,

    @InjectRepository(OrderEntity)
    private orderRepository: Repository<OrderEntity>,

    @InjectRepository(OrderItemsEntity)
    private orderItemsRepository: Repository<OrderItemsEntity>,

    private readonly redisService: RedisService,
  ) {
    this.client = new Redis();
  }

  private getRedisKey(userId: string | number): string {
    return `cart:${String(userId)}`;
  }

  async createOrderFromCart(user: UserEntity): Promise<OrderEntity> {
    const cart = await this.getOrCreateCart(user);
    if (cart.items.length === 0) {
      throw new Error('Carrinho vazio');
    }

    // Verifica estoque e calcula total
    let totalAmount = 0;
    for (const item of cart.items) {
      const product = await this.productRepository.findOneByOrFail({
        id: item.product.id,
      });
      if (product.stock_quantity < item.quantity) {
        throw new Error(
          `Estoque insuficiente para o produto ${product.product_name}`,
        );
      }
      totalAmount += product.price * item.quantity;
    }

    // Cria pedido
    const order = this.orderRepository.create({
      customer: user.customers,
      status: OrderStatus.Received,
      total_amount: totalAmount,
      orderItems: [],
    });
    await this.orderRepository.save(order);

    // Cria itens do pedido
    for (const item of cart.items) {
      const orderItem = this.orderItemsRepository.create({
        order,
        product: item.product,
        quantity: item.quantity,
        unit_price: item.product.price,
      });
      await this.orderItemsRepository.save(orderItem);
    }

    // Debita estoque
    for (const item of cart.items) {
      const product = await this.productRepository.findOneByOrFail({
        id: item.product.id,
      });
      product.stock_quantity -= item.quantity;
      await this.productRepository.save(product);
    }

    // Limpa carrinho e cache
    await this.clearCart(user);
    await this.redisService.del(this.getRedisKey(user.id));

    return this.orderRepository.findOneOrFail({
      where: { id: order.id },
      relations: ['customer', 'orderItems', 'orderItems.product'],
    });
  }

  // Simula pagamento e cria pedido se aprovado
  async processPayment(
    user: UserEntity,
    approved: boolean,
  ): Promise<OrderEntity | null> {
    if (!approved) {
      // Pagamento negado, pode atualizar status de pedido existente se desejar
      return null;
    }

    // Pagamento aprovado, cria pedido do carrinho
    return this.createOrderFromCart(user);
  }

  async getOrCreateCart(user: UserEntity): Promise<CartEntity> {
    let cart = await this.cartRepository.findOne({
      where: { user },
      relations: ['items', 'items.product'],
    });
    if (!cart) {
      cart = this.cartRepository.create({ user, items: [] });
      await this.cartRepository.save(cart);
    }
    return cart;
  }

  async clearCart(user: UserEntity) {
    const cart = await this.getOrCreateCart(user);

    // Remove os itens do banco
    await this.cartItemRepository.delete({ cart });

    // Limpa o cache no Redis usando o método `del` já existente
    await this.redisService.del(this.getRedisKey(user.id));

    return this.getOrCreateCart(user); // retorna carrinho limpo
  }
}
