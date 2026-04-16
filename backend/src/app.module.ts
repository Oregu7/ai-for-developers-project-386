import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { EventTypesModule } from './event-types/event-types.module.js';
import { BookingsModule } from './bookings/bookings.module.js';
import { SlotsModule } from './slots/slots.module.js';

@Module({
  imports: [EventTypesModule, BookingsModule, SlotsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
