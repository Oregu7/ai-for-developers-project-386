import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EventTypesService } from './event-types/event-types.service';
import { Owner } from './entities';
import { DataSource } from 'typeorm';

async function seed() {
  const logger = new Logger('Seed');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  try {
    const dataSource = app.get(DataSource);
    const ownerRepo = dataSource.getRepository(Owner);

    const ownerCount = await ownerRepo.count();
    if (ownerCount === 0) {
      await ownerRepo.save({ name: 'Tota', email: 'tota@example.com' });
      logger.log('Seeded owner: Tota');
    } else {
      logger.log('Owner already exists, skipping');
    }

    const eventTypesService = app.get(EventTypesService);
    const existing = await eventTypesService.list();
    const seeds = [
      {
        name: 'Встреча 15 минут',
        description: 'Короткий тип события для быстрого слота.',
        durationMinutes: 15,
      },
      {
        name: 'Встреча 30 минут',
        description: 'Стандартная встреча для обсуждения деталей.',
        durationMinutes: 30,
      },
    ];

    for (const seed of seeds) {
      const already = existing.items.find((e) => e.name === seed.name);
      if (already) {
        logger.log(`Event type '${seed.name}' already exists, skipping`);
        continue;
      }
      await eventTypesService.create(seed);
      logger.log(`Seeded event type: ${seed.name}`);
    }
  } finally {
    await app.close();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
