import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventType } from '../entities/index.js';
import { CreateEventTypeRequest } from './dto/request/create-event-type.request.js';
import { UpdateEventTypeRequest } from './dto/request/update-event-type.request.js';
import { EventTypeResponse } from './dto/response/event-type.response.js';
import { EventTypeListResponse } from './dto/response/event-type-list.response.js';
import { SlotsService } from '../slots/slots.service.js';
import { NotFoundApiException } from '../common/exceptions.js';

@Injectable()
export class EventTypesService {
  constructor(
    @InjectRepository(EventType)
    private readonly eventTypeRepository: Repository<EventType>,
    private readonly slotsService: SlotsService,
  ) {}

  async list(): Promise<EventTypeListResponse> {
    const eventTypes = await this.eventTypeRepository.find({
      order: { createdAt: 'ASC' },
    });
    return {
      items: eventTypes.map((e) => this.toResponse(e)),
    };
  }

  async getEntity(id: string): Promise<EventType> {
    const eventType = await this.eventTypeRepository.findOneBy({ id });
    if (!eventType) {
      throw new NotFoundApiException(`Event type '${id}' not found`);
    }
    return eventType;
  }

  async get(id: string): Promise<EventTypeResponse> {
    const eventType = await this.getEntity(id);
    return this.toResponse(eventType);
  }

  async create(dto: CreateEventTypeRequest): Promise<EventTypeResponse> {
    const eventType = this.eventTypeRepository.create(dto);
    const saved = await this.eventTypeRepository.save(eventType);
    await this.slotsService.regenerateForEventType(saved);
    return this.toResponse(saved);
  }

  async update(
    id: string,
    dto: UpdateEventTypeRequest,
  ): Promise<EventTypeResponse> {
    const existing = await this.getEntity(id);
    const durationChanged =
      dto.durationMinutes !== undefined &&
      dto.durationMinutes !== existing.durationMinutes;

    Object.assign(existing, dto);
    const saved = await this.eventTypeRepository.save(existing);

    if (durationChanged) {
      await this.slotsService.regenerateForEventType(saved);
    }

    return this.toResponse(saved);
  }

  async delete(id: string): Promise<void> {
    await this.getEntity(id);
    await this.slotsService.clearForEventType(id);
    await this.eventTypeRepository.delete(id);
  }

  private toResponse(entity: EventType): EventTypeResponse {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      durationMinutes: entity.durationMinutes,
      createdAt: entity.createdAt,
    };
  }
}
