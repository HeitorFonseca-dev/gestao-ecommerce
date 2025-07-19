import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../database/base/base.entity';

@Entity('product')
export class ProductEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  product_name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int' })
  stock_quantity: number;
}
