import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventType } from '../entities/index.js';
import { CreateEventTypeRequest } from './dto/request/create-event-type.request.js';
import { UpdateEventTypeRequest } from './dto/request/update-event-type.request.js';
import { EventTypeResponse } from './dto/response/event-type.response.js';
import { EventTypeListResponse } from './dto/response/event-type-list.response.js';

@Injectable()
export class EventTypesService {
  constructor(
    @InjectRepository(EventType)
    private readonly eventTypeRepository: Repository<EventType>,
  ) {}

  async list(): Promise<EventTypeListResponse> {
    const eventTypes = await this.eventTypeRepository.find();
    return {
      items: eventTypes.map(this.toResponse),
    };
  }

  async get(id: string): Promise<EventTypeResponse> {
    const eventType = await this.eventTypeRepository.findOneByOrFail({ id });
    return this.toResponse(eventType);
  }

  async create(dto: CreateEventTypeRequest): Promise<EventTypeResponse> {
    const eventType = this.eventTypeRepository.create(dto);
    const saved = await this.eventTypeRepository.save(eventType);
    return this.toResponse(saved);
  }

  async update(id: string, dto: UpdateEventTypeRequest): Promise<EventTypeResponse> {
    await this.eventTypeRepository.update(id, dto);
    const eventType = await this.eventTypeRepository.findOneByOrFail({ id });
    return this.toResponse(eventType);
  }

  async delete(id: string): Promise<void> {
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
