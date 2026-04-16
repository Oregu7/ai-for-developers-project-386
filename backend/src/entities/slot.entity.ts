import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EventType } from './event-type.entity.js';

@Entity('slots')
export class Slot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamptz' })
  startTime: Date;

  @Column({ type: 'timestamptz' })
  endTime: Date;

  @Column({ type: 'uuid' })
  eventTypeId: string;

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @ManyToOne(() => EventType, (eventType) => eventType.slots)
  @JoinColumn({ name: 'eventTypeId' })
  eventType: EventType;
}
