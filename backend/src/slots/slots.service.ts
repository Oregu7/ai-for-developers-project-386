import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { EventType, Slot } from '../entities/index.js';
import { AvailableSlotsResponse } from './dto/response/available-slots.response.js';
import { SlotResponse } from './dto/response/slot.response.js';
import {
  AVAILABILITY_DAYS,
  SLOT_INTERVAL_MINUTES,
  WORK_HOUR_END,
  WORK_HOUR_START,
} from './slot.constants.js';

@Injectable()
export class SlotsService {
  constructor(
    @InjectRepository(Slot)
    private readonly slotRepository: Repository<Slot>,
  ) {}

  async list(
    eventTypeId: string,
    fromDate?: Date,
    toDate?: Date,
  ): Promise<AvailableSlotsResponse> {
    const now = new Date();
    const from = fromDate && fromDate > now ? fromDate : now;
    const to =
      toDate ?? new Date(now.getTime() + AVAILABILITY_DAYS * 24 * 60 * 60 * 1000);

    const slots = await this.slotRepository.find({
      where: {
        eventTypeId,
        startTime: Between(from, to),
      },
      order: { startTime: 'ASC' },
    });

    return {
      eventTypeId,
      slots: slots.map((s) => this.toResponse(s)),
    };
  }

  /**
   * Materialize slots for the event type for the next AVAILABILITY_DAYS.
   * Preserves any already-booked slots (isAvailable=false) and rebuilds the rest.
   */
  async regenerateForEventType(eventType: EventType): Promise<void> {
    const now = new Date();
    const windowEnd = new Date(
      now.getTime() + AVAILABILITY_DAYS * 24 * 60 * 60 * 1000,
    );

    const bookedSlots = await this.slotRepository.find({
      where: {
        eventTypeId: eventType.id,
        isAvailable: false,
      },
    });
    const bookedKeys = new Set(
      bookedSlots.map((s) => s.startTime.toISOString()),
    );

    await this.slotRepository.delete({
      eventTypeId: eventType.id,
      isAvailable: true,
    });

    const scheduled = this.computeScheduledSlots(
      eventType.durationMinutes,
      now,
      windowEnd,
    );

    const toInsert: Partial<Slot>[] = scheduled
      .filter(({ startTime }) => !bookedKeys.has(startTime.toISOString()))
      .map(({ startTime, endTime }) => ({
        eventTypeId: eventType.id,
        startTime,
        endTime,
        isAvailable: true,
      }));

    if (toInsert.length > 0) {
      await this.slotRepository.insert(toInsert as Slot[]);
    }
  }

  async clearForEventType(eventTypeId: string): Promise<void> {
    await this.slotRepository.delete({ eventTypeId });
  }

  async findByEventTypeAndStart(
    eventTypeId: string,
    startTime: Date,
  ): Promise<Slot | null> {
    return this.slotRepository.findOne({
      where: {
        eventTypeId,
        startTime,
      },
    });
  }

  async markBooked(slotId: string): Promise<void> {
    await this.slotRepository.update(slotId, { isAvailable: false });
  }

  async markAvailableByEventTypeAndStart(
    eventTypeId: string,
    startTime: Date,
  ): Promise<void> {
    await this.slotRepository.update(
      { eventTypeId, startTime },
      { isAvailable: true },
    );
  }

  private computeScheduledSlots(
    durationMinutes: number,
    fromDate: Date,
    toDate: Date,
  ): Array<{ startTime: Date; endTime: Date }> {
    const slots: Array<{ startTime: Date; endTime: Date }> = [];
    let current = new Date(fromDate);
    current.setMinutes(0, 0, 0);
    if (current <= fromDate) {
      current = new Date(current.getTime() + 60 * 60 * 1000);
    }

    while (current < toDate) {
      const dayOfWeek = current.getDay();
      const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
      const hour = current.getHours();
      const inWorkHours = hour >= WORK_HOUR_START && hour < WORK_HOUR_END;

      if (isWeekday && inWorkHours) {
        const endTime = new Date(
          current.getTime() + durationMinutes * 60 * 1000,
        );
        const endHour = endTime.getHours();
        const endMinute = endTime.getMinutes();
        const endsBeforeWorkEnd =
          endHour < WORK_HOUR_END ||
          (endHour === WORK_HOUR_END && endMinute === 0);

        if (endsBeforeWorkEnd) {
          slots.push({ startTime: new Date(current), endTime });
        }
      }

      current = new Date(current.getTime() + SLOT_INTERVAL_MINUTES * 60 * 1000);
    }

    return slots;
  }

  private toResponse(slot: Slot): SlotResponse {
    return {
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: slot.isAvailable,
    };
  }
}
