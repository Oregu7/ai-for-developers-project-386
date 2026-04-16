# Calendar Booking API - Specification

## Task for AI Agent

Develop an API for a calendar booking system with the following requirements:

1. **Two roles**: Owner (predefined profile) and Guest (no registration required)
2. **Owner capabilities**: Manage event types, view all bookings
3. **Guest capabilities**: View event types, book available slots
4. **Business rules**:
   - No double-booking (one slot = one booking across all event types)
   - Booking window: 14 days from current date
   - No authentication/authorization system required

---

## Domain Model

### Entities

#### Owner (Владелец)
```
Owner {
  id: string        // Unique identifier
  name: string      // Display name
  email: string     // Contact email
}
```
- Single predefined profile
- Manages all event types
- Views all bookings

#### EventType (Тип события)
```
EventType {
  id: string              // Auto-generated UUID
  name: string            // Event name (e.g., "Consultation")
  description: string     // Detailed description
  durationMinutes: int32  // Duration: 5-480 minutes
  createdAt: datetime     // Creation timestamp
}
```
- Created and managed by owner
- Defines available booking types
- Duration determines slot length

#### Slot (Слот)
```
Slot {
  startTime: datetime     // Slot start time
  endTime: datetime       // Slot end time (startTime + duration)
  eventTypeId: string     // Associated event type
  isAvailable: boolean    // true = free, false = booked
}
```
- Time window for booking
- Calculated based on event type duration
- Availability checked across all bookings

#### Booking (Бронирование)
```
Booking {
  id: string              // Auto-generated UUID
  eventTypeId: string     // Reference to event type
  startTime: datetime     // Booking start
  endTime: datetime       // Booking end
  guestName: string       // Guest name
  guestEmail: string      // Guest email
  status: BookingStatus   // confirmed | cancelled
  createdAt: datetime     // Creation timestamp
}
```
- Created by guest without authentication
- Immutable after creation (can only be cancelled)

---

## API Endpoints

### Admin Endpoints (Owner)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/event-types` | List all event types |
| POST | `/api/admin/event-types` | Create event type |
| GET | `/api/admin/event-types/{id}` | Get event type |
| PATCH | `/api/admin/event-types/{id}` | Update event type |
| DELETE | `/api/admin/event-types/{id}` | Delete event type |
| GET | `/api/admin/bookings` | List all bookings |
| GET | `/api/admin/bookings/{id}` | Get booking details |
| DELETE | `/api/admin/bookings/{id}` | Cancel booking |

### Public Endpoints (Guest)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/event-types` | List event types |
| GET | `/api/public/event-types/{id}` | Get event type |
| GET | `/api/public/slots?eventTypeId={id}` | Get available slots |
| POST | `/api/public/bookings` | Create booking |
| GET | `/api/public/bookings/{id}` | Get booking details |

---

## Guest Public Scenario

```
1. Guest visits booking page
   └─> GET /api/public/event-types
       Returns: List of event types with name, description, duration

2. Guest selects event type
   └─> GET /api/public/event-types/{id}
       Returns: Detailed event type info

3. Guest views available slots
   └─> GET /api/public/slots?eventTypeId={id}&fromDate={now}&toDate={now+14d}
       Returns: Available slots for next 14 days

4. Guest books a slot
   └─> POST /api/public/bookings
       Body: { eventTypeId, startTime, guestName, guestEmail }
       Returns: Booking confirmation with ID

5. Guest receives confirmation
   └─> GET /api/public/bookings/{id}
       Returns: Booking details
```

---

## Business Rules

### Booking Window
- Slots available: 14 days from current date
- Calculation: `fromDate = now`, `toDate = now + 14 days`

### Occupancy Rule
- One slot can only have one booking
- Conflict detection: Check all bookings regardless of event type
- Validation: New booking's time range must not overlap existing bookings

### Slot Generation
```
For each event type:
  duration = event.durationMinutes
  For each day in [today, today + 14]:
    For each hour in working hours (e.g., 9:00 - 18:00):
      Generate slot(start: hour, end: hour + duration)
      Check availability against all existing bookings
```

---

## Error Responses

| HTTP Code | Error Code | Description |
|-----------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid request data |
| 404 | NOT_FOUND | Resource not found |
| 409 | SLOT_UNAVAILABLE | Slot already booked |
| 409 | OUTSIDE_BOOKING_WINDOW | Date outside 14-day window |
| 500 | INTERNAL_ERROR | Server error |

---

## TypeSpec Compilation

```bash
cd specs
npm install
npx tsp compile main.tsp --emit @typespec/openapi3
```

Output: `tsp-output/openapi.yaml`
