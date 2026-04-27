import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../entities/index.js';
import { BookingsController } from './bookings.controller.js';
import { BookingsService } from './bookings.service.js';
import { EventTypesModule } from '../event-types/event-types.module.js';
import { SlotsModule } from '../slots/slots.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Booking]), EventTypesModule, SlotsModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
