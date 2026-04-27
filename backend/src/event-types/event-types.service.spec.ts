import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventType } from '../entities/index.js';
import { EventTypesService } from './event-types.service.js';
import { SlotsService } from '../slots/slots.service.js';
import { NotFoundApiException } from '../common/exceptions.js';

describe('EventTypesService', () => {
  let service: EventTypesService;
  let repo: jest.Mocked<Repository<EventType>>;
  let slots: jest.Mocked<SlotsService>;

  beforeEach(async () => {
    const repoMock: Partial<jest.Mocked<Repository<EventType>>> = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const slotsMock: Partial<jest.Mocked<SlotsService>> = {
      regenerateForEventType: jest.fn(),
      clearForEventType: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        EventTypesService,
        { provide: getRepositoryToken(EventType), useValue: repoMock },
        { provide: SlotsService, useValue: slotsMock },
      ],
    }).compile();

    service = module.get(EventTypesService);
    repo = module.get(getRepositoryToken(EventType));
    slots = module.get(SlotsService);
  });

  it('throws NotFoundApiException when event type missing', async () => {
    repo.findOneBy.mockResolvedValue(null);
    await expect(service.get('missing')).rejects.toBeInstanceOf(
      NotFoundApiException,
    );
  });

  it('regenerates slots after create', async () => {
    const created = {
      id: 'a',
      name: 'X',
      description: 'D',
      durationMinutes: 15,
      createdAt: new Date(),
    } as EventType;
    repo.create.mockReturnValue(created);
    repo.save.mockResolvedValue(created);

    const res = await service.create({
      name: 'X',
      description: 'D',
      durationMinutes: 15,
    });

    expect(res.id).toBe('a');
    expect(slots.regenerateForEventType).toHaveBeenCalledWith(created);
  });

  it('regenerates slots only when duration changes on update', async () => {
    const existing = {
      id: 'a',
      name: 'X',
      description: 'D',
      durationMinutes: 15,
      createdAt: new Date(),
    } as EventType;
    repo.findOneBy.mockResolvedValue(existing);
    repo.save.mockImplementation(async (e) => e as EventType);

    await service.update('a', { name: 'Y' });
    expect(slots.regenerateForEventType).not.toHaveBeenCalled();

    await service.update('a', { durationMinutes: 30 });
    expect(slots.regenerateForEventType).toHaveBeenCalled();
  });

  it('clears slots when deleting', async () => {
    const existing = { id: 'a' } as EventType;
    repo.findOneBy.mockResolvedValue(existing);
    repo.delete.mockResolvedValue({ affected: 1, raw: {} } as any);

    await service.delete('a');

    expect(slots.clearForEventType).toHaveBeenCalledWith('a');
    expect(repo.delete).toHaveBeenCalledWith('a');
  });
});
