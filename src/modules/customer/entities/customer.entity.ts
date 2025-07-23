import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { BaseEntity } from '../../../database/base/base.entity';

@Entity('customer')
export class CustomerEntity extends BaseEntity {
  @OneToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  contact: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;
}
