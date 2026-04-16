import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import { CreateBookingRequest } from './dto/create-booking.request.js';
import { BookingResponse } from './dto/booking.response.js';
import { BookingListResponse } from './dto/booking-list.response.js';

@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // ---- Admin endpoints ----

  @Get('api/admin/bookings')
  async listAdmin(
    @Query('fromDate') fromDate?: string,
  ): Promise<BookingListResponse> {
    return this.bookingsService.list(
      fromDate ? new Date(fromDate) : undefined,
    );
  }

  @Get('api/admin/bookings/:id')
  async getAdmin(@Param('id') id: string): Promise<BookingResponse> {
    return this.bookingsService.get(id);
  }

  @Delete('api/admin/bookings/:id')
  async cancel(@Param('id') id: string): Promise<void> {
    return this.bookingsService.cancel(id);
  }

  // ---- Public endpoints ----

  @Post('api/public/bookings')
  async create(
    @Body() body: CreateBookingRequest,
  ): Promise<BookingResponse> {
    return this.bookingsService.create(body);
  }

  @Get('api/public/bookings/:id')
  async getPublic(@Param('id') id: string): Promise<BookingResponse> {
    return this.bookingsService.get(id);
  }
}
