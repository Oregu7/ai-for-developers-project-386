import { Controller, Get, Query } from '@nestjs/common';
import { SlotsService } from './slots.service.js';
import { AvailableSlotsResponse } from './dto/available-slots.response.js';

@Controller()
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  // ---- Public endpoints ----

  @Get('api/public/slots')
  async list(
    @Query('eventTypeId') eventTypeId: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ): Promise<AvailableSlotsResponse> {
    return this.slotsService.list(
      eventTypeId,
      fromDate ? new Date(fromDate) : undefined,
      toDate ? new Date(toDate) : undefined,
    );
  }
}
