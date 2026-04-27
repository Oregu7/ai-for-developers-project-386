import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { adminApi, publicApi } from './client';
import type {
  BookingCreateRequest,
  EventTypeCreateRequest,
  EventTypeUpdateRequest,
} from '@/types/api';

const keys = {
  publicEventTypes: ['public', 'event-types'] as const,
  publicEventType: (id: string) => ['public', 'event-types', id] as const,
  publicSlots: (id: string, fromDate?: string, toDate?: string) =>
    ['public', 'slots', id, fromDate ?? '', toDate ?? ''] as const,
  publicBooking: (id: string) => ['public', 'bookings', id] as const,
  adminEventTypes: ['admin', 'event-types'] as const,
  adminEventType: (id: string) => ['admin', 'event-types', id] as const,
  adminBookings: (fromDate?: string) =>
    ['admin', 'bookings', fromDate ?? ''] as const,
  adminBooking: (id: string) => ['admin', 'bookings', id] as const,
};

// --- Public ---

export function useEventTypes() {
  return useQuery({
    queryKey: keys.publicEventTypes,
    queryFn: () => publicApi.listEventTypes(),
  });
}

export function useEventType(id: string | undefined) {
  return useQuery({
    queryKey: keys.publicEventType(id ?? ''),
    queryFn: () => publicApi.getEventType(id!),
    enabled: !!id,
  });
}

export function useSlots(
  eventTypeId: string | undefined,
  fromDate?: string,
  toDate?: string,
) {
  return useQuery({
    queryKey: keys.publicSlots(eventTypeId ?? '', fromDate, toDate),
    queryFn: () =>
      publicApi.getAvailableSlots(eventTypeId!, fromDate, toDate),
    enabled: !!eventTypeId,
  });
}

export function useBooking(id: string | undefined) {
  return useQuery({
    queryKey: keys.publicBooking(id ?? ''),
    queryFn: () => publicApi.getBooking(id!),
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BookingCreateRequest) => publicApi.createBooking(data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: ['public', 'slots', vars.eventTypeId],
      });
      qc.invalidateQueries({ queryKey: ['admin', 'bookings'] });
    },
  });
}

// --- Admin ---

export function useAdminEventTypes() {
  return useQuery({
    queryKey: keys.adminEventTypes,
    queryFn: () => adminApi.listEventTypes(),
  });
}

export function useAdminEventType(id: string | undefined) {
  return useQuery({
    queryKey: keys.adminEventType(id ?? ''),
    queryFn: () => adminApi.getEventType(id!),
    enabled: !!id,
  });
}

export function useCreateEventType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EventTypeCreateRequest) => adminApi.createEventType(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.adminEventTypes });
      qc.invalidateQueries({ queryKey: keys.publicEventTypes });
    },
  });
}

export function useUpdateEventType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: EventTypeUpdateRequest;
    }) => adminApi.updateEventType(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.adminEventTypes });
      qc.invalidateQueries({ queryKey: keys.publicEventTypes });
    },
  });
}

export function useDeleteEventType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteEventType(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.adminEventTypes });
      qc.invalidateQueries({ queryKey: keys.publicEventTypes });
    },
  });
}

export function useAdminBookings(fromDate?: string) {
  return useQuery({
    queryKey: keys.adminBookings(fromDate),
    queryFn: () => adminApi.listBookings(fromDate),
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.cancelBooking(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'bookings'] });
      qc.invalidateQueries({ queryKey: ['public', 'slots'] });
    },
  });
}
