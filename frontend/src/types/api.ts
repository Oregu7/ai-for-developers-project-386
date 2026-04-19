export type BookingStatus = 'confirmed' | 'cancelled';

// --- Event Type ---

export interface EventType {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  createdAt: string;
}

export interface EventTypeListResponse {
  items: EventType[];
}

export interface EventTypeCreateRequest {
  name: string;
  description: string;
  durationMinutes: number;
}

export interface EventTypeUpdateRequest {
  name?: string;
  description?: string;
  durationMinutes?: number;
}

// --- Slot ---

export interface SlotResponse {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface AvailableSlotsResponse {
  eventTypeId: string;
  slots: SlotResponse[];
}

// --- Booking ---

export interface BookingResponse {
  id: string;
  eventTypeId: string;
  eventType: EventType;
  startTime: string;
  endTime: string;
  guestName: string;
  guestEmail: string;
  status: BookingStatus;
  createdAt: string;
}

export interface BookingListResponse {
  items: BookingResponse[];
  totalCount: number;
}

export interface BookingCreateRequest {
  eventTypeId: string;
  startTime: string;
  guestName: string;
  guestEmail: string;
}

// --- Error ---

export interface ErrorResponse {
  error: ErrorDetail;
}

export interface ErrorDetail {
  code: string;
  message: string;
  details?: string;
}
