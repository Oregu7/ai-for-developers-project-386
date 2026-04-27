import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Booking, BookingStatus, EventType, Slot } from '../entities/index.js';
import { BookingsService } from './bookings.service.js';
import { EventTypesService } from '../event-types/event-types.service.js';
import { SlotsService } from '../slots/slots.service.js';
import {
  NotFoundApiException,
  OutsideBookingWindowException,
  SlotUnavailableException,
} from '../common/exceptions.js';

interface ManagerMock {
  create: jest.Mock;
  save: jest.Mock;
  update: jest.Mock;
}

describe('BookingsService', () => {
  let service: BookingsService;
  let bookingRepo: jest.Mocked<Repository<Booking>>;
  let eventTypes: jest.Mocked<EventTypesService>;
  let slots: jest.Mocked<SlotsService>;
  let dataSource: jest.Mocked<DataSource>;
  let manager: ManagerMock;

  const futureDate = (offsetMs: number) => new Date(Date.now() + offsetMs);

  const baseEventType = (durationMinutes = 30): EventType =>
    ({
      id: 'et-1',
      name: 'Meeting',
      description: 'Test',
      durationMinutes,
      createdAt: new Date(),
      slots: [],
      bookings: [],
    }) as EventType;

  beforeEach(async () => {
    bookingRepo = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
    } as unknown as jest.Mocked<Repository<Booking>>;

    eventTypes = {
      getEntity: jest.fn(),
    } as unknown as jest.Mocked<EventTypesService>;

    slots = {
      findByEventTypeAndStart: jest.fn(),
      markAvailableByEventTypeAndStart: jest.fn(),
    } as unknown as jest.Mocked<SlotsService>;

    manager = {
      create: jest.fn((_entity, data) => ({ ...data, id: 'b-1' })),
      save: jest.fn(async (booking) => ({ ...booking, id: 'b-1' })),
      update: jest.fn(),
    };

    dataSource = {
      transaction: jest.fn(async (cb: any) => cb(manager)),
    } as unknown as jest.Mocked<DataSource>;

    const module = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: getRepositoryToken(Booking), useValue: bookingRepo },
        { provide: EventTypesService, useValue: eventTypes },
        { provide: SlotsService, useValue: slots },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get(BookingsService);
  });

  it('rejects bookings before now with OUTSIDE_BOOKING_WINDOW', async () => {
    eventTypes.getEntity.mockResolvedValue(baseEventType());

    await expect(
      service.create({
        eventTypeId: 'et-1',
        startTime: new Date(Date.now() - 60 * 1000),
        guestName: 'A',
        guestEmail: 'a@b.c',
      }),
    ).rejects.toBeInstanceOf(OutsideBookingWindowException);
  });

  it('rejects bookings beyond 14 days', async () => {
    eventTypes.getEntity.mockResolvedValue(baseEventType());

    await expect(
      service.create({
        eventTypeId: 'et-1',
        startTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        guestName: 'A',
        guestEmail: 'a@b.c',
      }),
    ).rejects.toBeInstanceOf(OutsideBookingWindowException);
  });

  it('rejects when overlapping confirmed booking exists', async () => {
    eventTypes.getEntity.mockResolvedValue(baseEventType(30));
    bookingRepo.findOne.mockResolvedValueOnce({
      id: 'other',
      status: BookingStatus.Confirmed,
    } as Booking);

    await expect(
      service.create({
        eventTypeId: 'et-1',
        startTime: futureDate(60 * 60 * 1000),
        guestName: 'A',
        guestEmail: 'a@b.c',
      }),
    ).rejects.toBeInstanceOf(SlotUnavailableException);
  });

  it('rejects when slot is marked unavailable', async () => {
    eventTypes.getEntity.mockResolvedValue(baseEventType(30));
    bookingRepo.findOne.mockResolvedValueOnce(null);
    slots.findByEventTypeAndStart.mockResolvedValue({
      id: 's-1',
      isAvailable: false,
    } as Slot);

    await expect(
      service.create({
        eventTypeId: 'et-1',
        startTime: futureDate(60 * 60 * 1000),
        guestName: 'A',
        guestEmail: 'a@b.c',
      }),
    ).rejects.toBeInstanceOf(SlotUnavailableException);
  });

  it('creates booking and marks slot booked when valid', async () => {
    eventTypes.getEntity.mockResolvedValue(baseEventType(30));
    bookingRepo.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'b-1',
        eventTypeId: 'et-1',
        startTime: new Date(),
        endTime: new Date(),
        guestName: 'A',
        guestEmail: 'a@b.c',
        status: BookingStatus.Confirmed,
        createdAt: new Date(),
        eventType: baseEventType(30),
      } as Booking);

    slots.findByEventTypeAndStart.mockResolvedValue({
      id: 's-1',
      isAvailable: true,
    } as Slot);

    const result = await service.create({
      eventTypeId: 'et-1',
      startTime: futureDate(60 * 60 * 1000),
      guestName: 'A',
      guestEmail: 'a@b.c',
    });

    expect(result.id).toBe('b-1');
    expect(dataSource.transaction).toHaveBeenCalled();
    expect(manager.update).toHaveBeenCalledWith(
      'slots',
      { id: 's-1' },
      { isAvailable: false },
    );
  });

  it('cancel marks booking cancelled and frees slot', async () => {
    const startTime = new Date();
    bookingRepo.findOne.mockResolvedValueOnce({
      id: 'b-1',
      eventTypeId: 'et-1',
      startTime,
    } as Booking);

    await service.cancel('b-1');

    expect(dataSource.transaction).toHaveBeenCalled();
    expect(manager.update).toHaveBeenCalledWith(
      Booking,
      { id: 'b-1' },
      { status: BookingStatus.Cancelled },
    );
    expect(slots.markAvailableByEventTypeAndStart).toHaveBeenCalledWith(
      'et-1',
      startTime,
    );
  });

  it('get throws NotFoundApiException when missing', async () => {
    bookingRepo.findOne.mockResolvedValue(null);
    await expect(service.get('missing')).rejects.toBeInstanceOf(
      NotFoundApiException,
    );
  });
});
