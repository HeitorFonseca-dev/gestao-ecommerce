import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
// import { UserEntity } from '../../../../src/modules/user/entities/user.entity';

@Entity('auth_refresh_token')
export class AuthRefreshTokenEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  // @ManyToOne(() => UserEntity)
  // @JoinColumn({ name: 'user_id' })
  // user: UserEntity;

  @CreateDateColumn()
  expire_in: Date;

  @CreateDateColumn()
  created_at: Date;
}
