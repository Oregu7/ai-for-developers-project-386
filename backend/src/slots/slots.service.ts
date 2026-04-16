import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Slot } from '../entities/index.js';
import { AvailableSlotsResponse } from './dto/available-slots.response.js';
import { SlotResponse } from './dto/slot.response.js';

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
    const queryBuilder = this.slotRepository
      .createQueryBuilder('slot')
      .where('slot.eventTypeId = :eventTypeId', { eventTypeId });

    if (fromDate) {
      queryBuilder.andWhere('slot.startTime >= :fromDate', { fromDate });
    }

    if (toDate) {
      queryBuilder.andWhere('slot.startTime <= :toDate', { toDate });
    }

    queryBuilder.orderBy('slot.startTime', 'ASC');

    const slots = await queryBuilder.getMany();

    return {
      eventTypeId,
      slots: slots.map(this.toResponse),
    };
  }

  private toResponse(slot: Slot): SlotResponse {
    return {
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: slot.isAvailable,
    };
  }
}
