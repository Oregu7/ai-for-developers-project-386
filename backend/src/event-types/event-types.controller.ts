import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { EventTypesService } from './event-types.service.js';
import { CreateEventTypeRequest } from './dto/create-event-type.request.js';
import { UpdateEventTypeRequest } from './dto/update-event-type.request.js';
import { EventTypeResponse } from './dto/event-type.response.js';
import { EventTypeListResponse } from './dto/event-type-list.response.js';

@Controller()
export class EventTypesController {
  constructor(private readonly eventTypesService: EventTypesService) {}

  // ---- Admin endpoints ----

  @Get('api/admin/event-types')
  async listAdmin(): Promise<EventTypeListResponse> {
    return this.eventTypesService.list();
  }

  @Post('api/admin/event-types')
  async create(
    @Body() body: CreateEventTypeRequest,
  ): Promise<EventTypeResponse> {
    return this.eventTypesService.create(body);
  }

  @Get('api/admin/event-types/:id')
  async getAdmin(@Param('id') id: string): Promise<EventTypeResponse> {
    return this.eventTypesService.get(id);
  }

  @Patch('api/admin/event-types/:id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateEventTypeRequest,
  ): Promise<EventTypeResponse> {
    return this.eventTypesService.update(id, body);
  }

  @Delete('api/admin/event-types/:id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.eventTypesService.delete(id);
  }

  // ---- Public endpoints ----

  @Get('api/public/event-types')
  async listPublic(): Promise<EventTypeListResponse> {
    return this.eventTypesService.list();
  }

  @Get('api/public/event-types/:id')
  async getPublic(@Param('id') id: string): Promise<EventTypeResponse> {
    return this.eventTypesService.get(id);
  }
}
