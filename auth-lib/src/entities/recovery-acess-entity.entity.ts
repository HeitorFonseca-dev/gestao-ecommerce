import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
// import { UserEntity } from '../../../../src/modules/user/entities/user.entity';

@Entity('recovery_access')
export class RecoveryAcessEntity {
  @PrimaryGeneratedColumn('increment')
  id?: number;

  @Column({ type: 'varchar', length: 160, nullable: false })
  token: string;

  @Column({ type: 'boolean' })
  status: boolean;

  // @ManyToOne(() => UserEntity, { eager: true })
  // @JoinColumn({ name: 'user_id' })
  // user: UserEntity;

  @CreateDateColumn()
  expire_in: Date;

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn({ onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updated_at?: Date;
}
