import { Controller, Get, Post, Delete, Request, Body } from '@nestjs/common';
import { CartService } from '../services/cart.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('cart')
@ApiTags('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Request() req) {
    return this.cartService.getOrCreateCart(req.user);
  }

  @Delete()
  clearCart(@Request() req) {
    return this.cartService.clearCart(req.user);
  }

  @Post('checkout')
  checkout(@Request() req) {
    return this.cartService.createOrderFromCart(req.user);
  }

  @Post('payment')
  simulatePayment(@Request() req, @Body('approved') approved: boolean) {
    return this.cartService.processPayment(req.user, approved);
  }
}
