import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ProductEntity } from '../../../product/entities/product.entity';
import { BaseEntity } from '../../../../database/base/base.entity';
import { OrderEntity } from '../../entities/order.entity';

@Entity('order_items')
export class OrderItemsEntity extends BaseEntity {
  @ManyToOne(() => OrderEntity, { eager: true, nullable: false })
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @ManyToOne(() => ProductEntity, { eager: true, nullable: false })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column({ name: 'quantity', type: 'int', nullable: false })
  quantity: number;

  @Column({ name: 'unit_price', type: 'float', nullable: false })
  unit_price: number;

  @Column({ name: 'subtotal', type: 'float', nullable: false })
  subtotal: number;
}
