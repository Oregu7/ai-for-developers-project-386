import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { EventTypesModule } from './event-types/event-types.module.js';
import { BookingsModule } from './bookings/bookings.module.js';
import { SlotsModule } from './slots/slots.module.js';
import { Owner, EventType, Slot, Booking } from './entities/index.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>(
          'DATABASE_URL',
          'postgres://booking:booking@localhost:5432/booking',
        ),
        entities: [Owner, EventType, Slot, Booking],
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    EventTypesModule,
    BookingsModule,
    SlotsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
