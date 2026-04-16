import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from '../entities/index.js';
import { CreateBookingRequest } from './dto/create-booking.request.js';
import { BookingResponse } from './dto/booking.response.js';
import { BookingListResponse } from './dto/booking-list.response.js';
import { EventTypesService } from '../event-types/event-types.service.js';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly eventTypesService: EventTypesService,
  ) {}

  async list(fromDate?: Date): Promise<BookingListResponse> {
    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.eventType', 'eventType')
      .where('booking.status = :status', { status: BookingStatus.Confirmed });

    if (fromDate) {
      queryBuilder.andWhere('booking.startTime >= :fromDate', { fromDate });
    }

    queryBuilder.orderBy('booking.startTime', 'ASC');

    const [items, totalCount] = await queryBuilder.getManyAndCount();
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
      throw new Error(`Booking with id ${id} not found`);
    }
    return this.toResponse(booking);
  }

  async create(dto: CreateBookingRequest): Promise<BookingResponse> {
    const eventTypeEntity = await this.eventTypesService.get(dto.eventTypeId);

    const startTime = new Date(dto.startTime);
    const endTime = new Date(
      startTime.getTime() + eventTypeEntity.durationMinutes * 60 * 1000,
    );

    const booking = this.bookingRepository.create({
      eventTypeId: dto.eventTypeId,
      startTime,
      endTime,
      guestName: dto.guestName,
      guestEmail: dto.guestEmail,
      status: BookingStatus.Confirmed,
    });

    const saved = await this.bookingRepository.save(booking);
    return this.get(saved.id);
  }

  async cancel(id: string): Promise<void> {
    await this.bookingRepository.update(id, {
      status: BookingStatus.Cancelled,
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
