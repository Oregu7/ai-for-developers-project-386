import { IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateEventTypeRequest {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name: string;

  @IsString()
  @MaxLength(500)
  description: string;

  @IsInt()
  @Min(5)
  @Max(480)
  durationMinutes: number;
}
