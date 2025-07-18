import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column } from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number | string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @Column({ name: 'created_by', nullable: true })
  created_by?: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @Column({ name: 'updated_by', nullable: true })
  updated_by?: string;

  // @CreateDateColumn({ name: 'deleted_at' })
  // deleted_at: Date;

  // @Column({ name: 'deleted_by', nullable: true })
  // deleted_by?: string | null;
}
