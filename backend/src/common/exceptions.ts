import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';

export class ApiException extends HttpException {
  constructor(status: HttpStatus, code: string, message: string) {
    super({ code, message }, status);
  }
}

export class NotFoundApiException extends NotFoundException {
  constructor(message: string, code = 'NOT_FOUND') {
    super({ code, message });
  }
}

export class ValidationApiException extends BadRequestException {
  constructor(message: string, code = 'VALIDATION_ERROR') {
    super({ code, message });
  }
}

export class ConflictApiException extends ConflictException {
  constructor(message: string, code = 'CONFLICT') {
    super({ code, message });
  }
}

export class SlotUnavailableException extends ConflictApiException {
  constructor(message = 'Slot is already booked') {
    super(message, 'SLOT_UNAVAILABLE');
  }
}

export class OutsideBookingWindowException extends BadRequestException {
  constructor(message: string) {
    super({ code: 'OUTSIDE_BOOKING_WINDOW', message });
  }
}
