import { BookingResponse } from './booking.response.js';

export class BookingListResponse {
  items: BookingResponse[];
  totalCount: number;
}
