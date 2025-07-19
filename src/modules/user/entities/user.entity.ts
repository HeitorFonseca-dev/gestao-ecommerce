import { Column, Entity, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../database/base/base.entity';
import { Profiles } from '../enum/profiles.enum';
import { Exclude } from 'class-transformer';
import { CustomerEntity } from '../../customer/entities/customer.entity';

@Entity('user')
export class UserEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 30, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  phone: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'varchar', length: 30, nullable: false })
  role: Profiles;

  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  password: string | null;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @Column({ type: 'varchar', nullable: true })
  deleted_by: string;

  @OneToOne(() => CustomerEntity, customer => customer.user)
  customers: CustomerEntity;
}
