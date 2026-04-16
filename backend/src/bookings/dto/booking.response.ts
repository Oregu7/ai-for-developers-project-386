import { EventTypeResponse } from '../../event-types/dto/event-type.response.js';
import { BookingStatus } from '../../entities/index.js';

export class BookingResponse {
  id: string;
  eventTypeId: string;
  eventType: EventTypeResponse;
  startTime: Date;
  endTime: Date;
  guestName: string;
  guestEmail: string;
  status: BookingStatus;
  createdAt: Date;
}
