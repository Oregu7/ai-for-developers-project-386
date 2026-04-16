import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EventType } from './event-type.entity.js';

export enum BookingStatus {
  Confirmed = 'confirmed',
  Cancelled = 'cancelled',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  eventTypeId: string;

  @Column({ type: 'timestamptz' })
  startTime: Date;

  @Column({ type: 'timestamptz' })
  endTime: Date;

  @Column({ type: 'varchar' })
  guestName: string;

  @Column({ type: 'varchar' })
  guestEmail: string;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.Confirmed,
  })
  status: BookingStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => EventType, (eventType) => eventType.bookings)
  @JoinColumn({ name: 'eventTypeId' })
  eventType: EventType;
}
