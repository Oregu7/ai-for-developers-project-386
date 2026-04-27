import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventType } from '../entities/index.js';
import { EventTypesController } from './event-types.controller.js';
import { EventTypesService } from './event-types.service.js';
import { SlotsModule } from '../slots/slots.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([EventType]), SlotsModule],
  controllers: [EventTypesController],
  providers: [EventTypesService],
  exports: [EventTypesService],
})
export class EventTypesModule {}
