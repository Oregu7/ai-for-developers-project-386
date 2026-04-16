# Backend Agents

AI agent guidelines for working with the Calendar Booking API backend.

## Project Overview

NestJS + TypeORM backend for a calendar booking system with two roles: Owner (manages event types, views all bookings) and Guest (views event types, books available slots). No authentication required.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: NestJS 11
- **ORM**: TypeORM 0.3.x via @nestjs/typeorm
- **Language**: TypeScript 5.7+ (ESM-style imports with `.js` extensions)
- **Testing**: Jest + ts-jest
- **Linting**: ESLint + Prettier

## Commands

```bash
npm run build          # Compile TypeScript
npm run start:dev      # Dev server with watch
npm run lint           # Lint & fix
npm test               # Unit tests
npm run test:e2e       # E2E tests
npx tsc --noEmit       # Type-check without emitting
```

## Project Structure

```
src/
  main.ts              # Bootstrap, port from PORT env
  app.module.ts         # Root module
  app.controller.ts     # Root controller
  app.service.ts        # Root service
  entities/
    owner.entity.ts     # Owner (id, name, email)
    event-type.entity.ts # EventType (id, name, description, durationMinutes, createdAt) + relations
    slot.entity.ts      # Slot (id, startTime, endTime, eventTypeId, isAvailable) + relation
    booking.entity.ts   # Booking (id, eventTypeId, startTime, endTime, guestName, guestEmail, status, createdAt) + relation + BookingStatus enum
    index.ts            # Barrel exports
```

## Entity Relationships

- `EventType` → `Slot` (1:N, `@OneToMany` / `@ManyToOne`)
- `EventType` → `Booking` (1:N, `@OneToMany` / `@ManyToOne`)
- `Slot.eventType` and `Booking.eventType` use `@JoinColumn({ name: 'eventTypeId' })`
- `BookingStatus` enum: `confirmed`, `cancelled`

## API Endpoints (from TypeSpec spec)

### Admin (Owner)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/event-types` | List all event types |
| POST | `/api/admin/event-types` | Create event type |
| GET | `/api/admin/event-types/{id}` | Get event type |
| PATCH | `/api/admin/event-types/{id}` | Update event type |
| DELETE | `/api/admin/event-types/{id}` | Delete event type |
| GET | `/api/admin/bookings` | List all bookings |
| GET | `/api/admin/bookings/{id}` | Get booking |
| DELETE | `/api/admin/bookings/{id}` | Cancel booking |

### Public (Guest)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/event-types` | List event types |
| GET | `/api/public/event-types/{id}` | Get event type |
| GET | `/api/public/slots?eventTypeId={id}` | Get available slots |
| POST | `/api/public/bookings` | Create booking |
| GET | `/api/public/bookings/{id}` | Get booking |

## Business Rules

- **No double-booking**: One slot = one booking across all event types
- **Booking window**: 14 days from current date
- **Slot generation**: Working hours (9:00–18:00), slot length = event type `durationMinutes`
- **Booking immutability**: Bookings can only be cancelled, not modified

## Error Codes

| HTTP | Code | Description |
|------|------|-------------|
| 400 | VALIDATION_ERROR | Invalid request data |
| 404 | NOT_FOUND | Resource not found |
| 409 | SLOT_UNAVAILABLE | Slot already booked |
| 409 | OUTSIDE_BOOKING_WINDOW | Date outside 14-day window |
| 500 | INTERNAL_ERROR | Server error |

## Coding Conventions

- Use `.js` extensions in import paths (TypeScript ESM resolution)
- TypeORM entities use `@Entity('snake_case_table')` with snake_case table names
- Column types are explicit: `type: 'varchar'`, `type: 'timestamptz'`, `type: 'uuid'`, `type: 'enum'`
- UUID primary keys via `@PrimaryGeneratedColumn('uuid')`
- Timestamps use `@CreateDateColumn({ type: 'timestamptz' })`
- Barrel exports in `index.ts`
- NestJS module structure: controller + service + module per feature

## What Needs to Be Built

The entities are complete. The following still need implementation:

1. **TypeORM configuration** in `AppModule` (database connection, entity registration)
2. **Feature modules**: `EventTypeModule`, `SlotModule`, `BookingModule` (each with controller + service + module)
3. **DTOs** with validation: `CreateEventTypeDto`, `UpdateEventTypeDto`, `CreateBookingDto`, etc.
4. **Slot generation logic**: Compute available slots from event type duration + booking window
5. **Conflict detection**: Prevent double-booking across event types
6. **Error handling**: Custom exceptions matching the error codes above
7. **Owner seed**: Predefined owner profile in database
