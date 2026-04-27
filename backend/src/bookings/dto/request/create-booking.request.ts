import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateBookingRequest {
  @IsUUID()
  eventTypeId: string;

  @Type(() => Date)
  @IsDate()
  startTime: Date;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  guestName: string;

  @IsEmail()
  @MaxLength(254)
  guestEmail: string;
}
