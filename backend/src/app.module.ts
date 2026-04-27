import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
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
        retryAttempts: 0,
        manualInitialization: true,
        connectTimeoutMS: 10000,
        extra: {
          connectionTimeoutMillis: 10000,
        },
      }),
      dataSourceFactory: async (options) => {
        const logger = new Logger('TypeORM');
        const retryAttempts = 3;
        const retryDelay = 3000;

        for (let attempt = 1; attempt <= retryAttempts; attempt++) {
          try {
            const dataSource = new DataSource(options!);
            await dataSource.initialize();
            logger.log('Database connection established');
            return dataSource;
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            if (attempt < retryAttempts) {
              logger.warn(
                `Unable to connect to the database. Retrying (${attempt}/${retryAttempts})... ${message}`,
              );
              await new Promise((resolve) => setTimeout(resolve, retryDelay));
            } else {
              logger.warn(
                `Failed to connect to the database after ${retryAttempts} attempts. The app will start without a DB connection. ${message}`,
              );
            }
          }
        }

        return new DataSource(options!);
      },
    }),
    EventTypesModule,
    BookingsModule,
    SlotsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
