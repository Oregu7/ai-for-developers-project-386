import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.OpenAPI;

@service(#{title: "Calendar Booking API"})
namespace CalendarBookingApi {

// ============================================================================
// Domain Models
// ============================================================================

/** Owner profile - single predefined calendar owner */
model Owner {
  @key
  id: string;
  name: string;
  email: string;
}

/** Event type created by owner */
model EventType {
  @key
  id: string;
  name: string;
  description: string;
  durationMinutes: int32;
  createdAt: utcDateTime;
}

/** Time slot for booking */
model Slot {
  startTime: utcDateTime;
  endTime: utcDateTime;
  eventTypeId: string;
  isAvailable: boolean;
}

/** Booking created by guest */
model Booking {
  @key
  id: string;
  eventTypeId: string;
  startTime: utcDateTime;
  endTime: utcDateTime;
  guestName: string;
  guestEmail: string;
  status: BookingStatus;
  createdAt: utcDateTime;
}

/** Booking status */
enum BookingStatus {
  Confirmed: "confirmed";
  Cancelled: "cancelled";
}

// ============================================================================
// API Models
// ============================================================================

// --- Event Type Models ---

model EventTypeCreateRequest {
  name: string;
  description: string;
  durationMinutes: int32;
}

model EventTypeUpdateRequest {
  name?: string;
  description?: string;
  durationMinutes?: int32;
}

model EventTypeResponse {
  id: string;
  name: string;
  description: string;
  durationMinutes: int32;
  createdAt: utcDateTime;
}

model EventTypeListResponse {
  items: EventTypeResponse[];
}

// --- Slot Models ---

model AvailableSlotsResponse {
  eventTypeId: string;
  slots: SlotResponse[];
}

model SlotResponse {
  startTime: utcDateTime;
  endTime: utcDateTime;
  isAvailable: boolean;
}

// --- Booking Models ---

model BookingCreateRequest {
  eventTypeId: string;
  startTime: utcDateTime;
  guestName: string;
  guestEmail: string;
}

model BookingResponse {
  id: string;
  eventTypeId: string;
  eventType: EventTypeResponse;
  startTime: utcDateTime;
  endTime: utcDateTime;
  guestName: string;
  guestEmail: string;
  status: BookingStatus;
  createdAt: utcDateTime;
}

model BookingListResponse {
  items: BookingResponse[];
  totalCount: int32;
}

// --- Error Models ---

model ErrorResponse {
  error: ErrorDetail;
}

model ErrorDetail {
  code: string;
  message: string;
  details?: string;
}

// ============================================================================
// API Operations
// ============================================================================

// Admin endpoints (Owner operations)

@route("/api/admin/event-types")
namespace EventTypesAdmin {
  /** List all event types (Owner) */
  @get
  op list(): EventTypeListResponse | ErrorResponse;
  
  /** Create a new event type (Owner) */
  @post
  op create(@body body: EventTypeCreateRequest): EventTypeResponse | ErrorResponse;
  
  /** Get event type by ID (Owner) */
  @get
  @route("{id}")
  op get(@path id: string): EventTypeResponse | ErrorResponse;
  
  /** Update event type (Owner) */
  @patch
  @route("{id}")
  op update(@path id: string, @body body: EventTypeUpdateRequest): EventTypeResponse | ErrorResponse;
  
  /** Delete event type (Owner) */
  @delete
  @route("{id}")
  op delete(@path id: string): void | ErrorResponse;
}

@route("/api/admin/bookings")
namespace BookingsAdmin {
  /** List all upcoming bookings (Owner) */
  @get
  op list(@query fromDate?: utcDateTime): BookingListResponse | ErrorResponse;
  
  /** Get booking details (Owner) */
  @get
  @route("{id}")
  op get(@path id: string): BookingResponse | ErrorResponse;
  
  /** Cancel booking (Owner) */
  @delete
  @route("{id}")
  op cancel(@path id: string): void | ErrorResponse;
}

// Public endpoints (Guest operations)

@route("/api/public/event-types")
namespace EventTypesPublic {
  /** List available event types (Guest) */
  @get
  op list(): EventTypeListResponse | ErrorResponse;
  
  /** Get event type details (Guest) */
  @get
  @route("{id}")
  op get(@path id: string): EventTypeResponse | ErrorResponse;
}

@route("/api/public/slots")
namespace SlotsPublic {
  /** Get available slots for event type (Guest) */
  @get
  op list(
    @query eventTypeId: string,
    @query fromDate?: utcDateTime,
    @query toDate?: utcDateTime
  ): AvailableSlotsResponse | ErrorResponse;
}

@route("/api/public/bookings")
namespace BookingsPublic {
  /** Create a new booking (Guest) */
  @post
  op create(@body body: BookingCreateRequest): BookingResponse | ErrorResponse;
  
  /** Get booking details by ID (Guest - for confirmation) */
  @get
  @route("{id}")
  op get(@path id: string): BookingResponse | ErrorResponse;
}

} // end namespace CalendarBookingApi
