import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../database/base/base.entity';
import { CustomerEntity } from '../../customer/entities/customer.entity';

@Entity('order')
export class OrderEntity extends BaseEntity {
  @ManyToOne(() => CustomerEntity, { eager: true, nullable: false })
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @Column({ name: 'status', type: 'varchar', nullable: false })
  status: string;

  @Column({ name: 'total_amount', type: 'float', nullable: false })
  total_amount: number;
}
