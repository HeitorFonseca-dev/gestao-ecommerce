import {
  Controller,
  UseGuards,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Request,
  Param,
} from '@nestjs/common';
import { AddToCartDTO } from '../dto/cart.dto';
import { CartService } from '../services/cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Request() req) {
    return this.cartService.getCart(req.user);
  }

  @Post()
  addToCart(@Request() req, @Body() dto: AddToCartDTO) {
    return this.cartService.addToCart(req.user, dto);
  }

  @Patch()
  updateQuantity(@Request() req, @Body() dto: AddToCartDTO) {
    return this.cartService.updateQuantity(req.user, dto);
  }

  @Delete(':productId')
  removeItem(@Request() req, @Param('productId') productId: string) {
    return this.cartService.removeItem(req.user, productId);
  }

  @Delete()
  clearCart(@Request() req) {
    return this.cartService.clearCart(req.user);
  }
}
