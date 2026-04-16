import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Slot } from './slot.entity.js';
import { Booking } from './booking.entity.js';

@Entity('event_types')
export class EventType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'integer' })
  durationMinutes: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => Slot, (slot) => slot.eventType)
  slots: Slot[];

  @OneToMany(() => Booking, (booking) => booking.eventType)
  bookings: Booking[];
}
