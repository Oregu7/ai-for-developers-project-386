import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, LessThan, MoreThan, Repository } from 'typeorm';
import { Booking, BookingStatus } from '../entities/index.js';
import { CreateBookingRequest } from './dto/request/create-booking.request.js';
import { BookingResponse } from './dto/response/booking.response.js';
import { BookingListResponse } from './dto/response/booking-list.response.js';
import { EventTypesService } from '../event-types/event-types.service.js';
import { SlotsService } from '../slots/slots.service.js';
import { AVAILABILITY_DAYS } from '../slots/slot.constants.js';
import {
  NotFoundApiException,
  OutsideBookingWindowException,
  SlotUnavailableException,
} from '../common/exceptions.js';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly eventTypesService: EventTypesService,
    private readonly slotsService: SlotsService,
    private readonly dataSource: DataSource,
  ) {}

  async list(fromDate?: Date): Promise<BookingListResponse> {
    const qb = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.eventType', 'eventType')
      .where('booking.status = :status', { status: BookingStatus.Confirmed });

    if (fromDate) {
      qb.andWhere('booking.startTime >= :fromDate', { fromDate });
    }

    qb.orderBy('booking.startTime', 'ASC');

    const [items, totalCount] = await qb.getManyAndCount();
    return {
      items: items.map((b) => this.toResponse(b)),
      totalCount,
    };
  }

  async get(id: string): Promise<BookingResponse> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['eventType'],
    });
    if (!booking) {
      throw new NotFoundApiException(`Booking '${id}' not found`);
    }
    return this.toResponse(booking);
  }

  async create(dto: CreateBookingRequest): Promise<BookingResponse> {
    const eventType = await this.eventTypesService.getEntity(dto.eventTypeId);

    const startTime = new Date(dto.startTime);
    const endTime = new Date(
      startTime.getTime() + eventType.durationMinutes * 60 * 1000,
    );

    const now = new Date();
    if (startTime < now) {
      throw new OutsideBookingWindowException('Cannot book in the past');
    }
    const windowEnd = new Date(
      now.getTime() + AVAILABILITY_DAYS * 24 * 60 * 60 * 1000,
    );
    if (startTime > windowEnd) {
      throw new OutsideBookingWindowException(
        `Booking window is ${AVAILABILITY_DAYS} days`,
      );
    }

    const overlap = await this.bookingRepository.findOne({
      where: {
        status: BookingStatus.Confirmed,
        startTime: LessThan(endTime),
        endTime: MoreThan(startTime),
      },
    });
    if (overlap) {
      throw new SlotUnavailableException();
    }

    const slot = await this.slotsService.findByEventTypeAndStart(
      eventType.id,
      startTime,
    );
    if (slot && !slot.isAvailable) {
      throw new SlotUnavailableException();
    }

    const savedId = await this.dataSource.transaction(async (manager) => {
      const booking = manager.create(Booking, {
        eventTypeId: eventType.id,
        startTime,
        endTime,
        guestName: dto.guestName,
        guestEmail: dto.guestEmail,
        status: BookingStatus.Confirmed,
      });
      const persisted = await manager.save(booking);

      if (slot) {
        await manager.update('slots', { id: slot.id }, { isAvailable: false });
      }

      return persisted.id;
    });

    return this.get(savedId);
  }

  async cancel(id: string): Promise<void> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
    });
    if (!booking) {
      throw new NotFoundApiException(`Booking '${id}' not found`);
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.update(
        Booking,
        { id },
        { status: BookingStatus.Cancelled },
      );

      await this.slotsService.markAvailableByEventTypeAndStart(
        booking.eventTypeId,
        booking.startTime,
      );
    });
  }

  private toResponse(booking: Booking): BookingResponse {
    return {
      id: booking.id,
      eventTypeId: booking.eventTypeId,
      eventType: {
        id: booking.eventType.id,
        name: booking.eventType.name,
        description: booking.eventType.description,
        durationMinutes: booking.eventType.durationMinutes,
        createdAt: booking.eventType.createdAt,
      },
      startTime: booking.startTime,
      endTime: booking.endTime,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      status: booking.status,
      createdAt: booking.createdAt,
    };
  }
}
