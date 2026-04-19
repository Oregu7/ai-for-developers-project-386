import type {
  EventType,
  EventTypeListResponse,
  EventTypeCreateRequest,
  EventTypeUpdateRequest,
  AvailableSlotsResponse,
  BookingResponse,
  BookingListResponse,
  BookingCreateRequest,
  ErrorResponse,
} from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4010';

class ApiError extends Error {
  status: number;
  body: ErrorResponse;

  constructor(status: number, body: ErrorResponse) {
    super(body.error.message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body: ErrorResponse = await res.json();
    throw new ApiError(res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// --- Public API (Guest) ---

export const publicApi = {
  listEventTypes: () =>
    request<EventTypeListResponse>('/api/public/event-types'),

  getEventType: (id: string) =>
    request<EventType>(`/api/public/event-types/${id}`),

  getAvailableSlots: (eventTypeId: string, fromDate?: string, toDate?: string) => {
    const params = new URLSearchParams({ eventTypeId });
    if (fromDate) params.set('fromDate', fromDate);
    if (toDate) params.set('toDate', toDate);
    return request<AvailableSlotsResponse>(`/api/public/slots?${params}`);
  },

  createBooking: (data: BookingCreateRequest) =>
    request<BookingResponse>('/api/public/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getBooking: (id: string) =>
    request<BookingResponse>(`/api/public/bookings/${id}`),
};

// --- Admin API (Owner) ---

export const adminApi = {
  listEventTypes: () =>
    request<EventTypeListResponse>('/api/admin/event-types'),

  createEventType: (data: EventTypeCreateRequest) =>
    request<EventType>('/api/admin/event-types', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getEventType: (id: string) =>
    request<EventType>(`/api/admin/event-types/${id}`),

  updateEventType: (id: string, data: EventTypeUpdateRequest) =>
    request<EventType>(`/api/admin/event-types/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteEventType: (id: string) =>
    request<void>(`/api/admin/event-types/${id}`, { method: 'DELETE' }),

  listBookings: (fromDate?: string) => {
    const params = fromDate ? `?fromDate=${fromDate}` : '';
    return request<BookingListResponse>(`/api/admin/bookings${params}`);
  },

  getBooking: (id: string) =>
    request<BookingResponse>(`/api/admin/bookings/${id}`),

  cancelBooking: (id: string) =>
    request<void>(`/api/admin/bookings/${id}`, { method: 'DELETE' }),
};
