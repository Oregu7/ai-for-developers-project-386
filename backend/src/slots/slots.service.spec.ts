import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Slot, EventType } from '../entities/index.js';
import { SlotsService } from './slots.service.js';

describe('SlotsService', () => {
  let service: SlotsService;
  let repo: jest.Mocked<Repository<Slot>>;

  beforeEach(async () => {
    const repoMock: Partial<jest.Mocked<Repository<Slot>>> = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      delete: jest.fn().mockResolvedValue({ affected: 0, raw: {} } as any),
      insert: jest.fn().mockResolvedValue({} as any),
      update: jest.fn().mockResolvedValue({ affected: 1, raw: {} } as any),
    };

    const module = await Test.createTestingModule({
      providers: [
        SlotsService,
        { provide: getRepositoryToken(Slot), useValue: repoMock },
      ],
    }).compile();

    service = module.get(SlotsService);
    repo = module.get(getRepositoryToken(Slot));
  });

  it('generates only weekday work-hour slots within window', async () => {
    const eventType: EventType = {
      id: 'et-1',
      durationMinutes: 30,
    } as EventType;

    await service.regenerateForEventType(eventType);

    expect(repo.delete).toHaveBeenCalledWith({
      eventTypeId: 'et-1',
      isAvailable: true,
    });

    const insertCall = repo.insert.mock.calls[0]?.[0] as Array<{
      startTime: Date;
      endTime: Date;
    }>;
    expect(Array.isArray(insertCall)).toBe(true);

    for (const slot of insertCall) {
      const dow = slot.startTime.getDay();
      expect(dow).toBeGreaterThanOrEqual(1);
      expect(dow).toBeLessThanOrEqual(5);

      const hour = slot.startTime.getHours();
      expect(hour).toBeGreaterThanOrEqual(9);
      expect(hour).toBeLessThan(18);

      expect(slot.endTime.getTime() - slot.startTime.getTime()).toBe(
        30 * 60 * 1000,
      );
    }
  });

  it('clears slots for event type', async () => {
    await service.clearForEventType('et-1');
    expect(repo.delete).toHaveBeenCalledWith({ eventTypeId: 'et-1' });
  });
});
