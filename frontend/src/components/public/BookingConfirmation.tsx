import type { BookingResponse } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, CheckCircle, User, Mail } from 'lucide-react';

interface BookingConfirmationProps {
  booking: BookingResponse;
  onNewBooking: () => void;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function BookingConfirmation({ booking, onNewBooking }: BookingConfirmationProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <CheckCircle className="size-12 text-green-500" />
        <h2 className="text-2xl font-semibold">Booking Confirmed!</h2>
      </div>

      <Card className="text-left">
        <CardHeader>
          <CardTitle className="text-base">Booking Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="size-4 text-muted-foreground" />
            <span>{formatDate(booking.startTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="size-4 text-muted-foreground" />
            <span>
              {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="size-4 text-muted-foreground" />
            <span>{booking.guestName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="size-4 text-muted-foreground" />
            <span>{booking.guestEmail}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Event:</span>
            <span>{booking.eventType.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant="secondary">{booking.status}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Booking ID: {booking.id}
          </p>
        </CardContent>
      </Card>

      <Button onClick={onNewBooking} variant="outline">
        Book Another
      </Button>
    </div>
  );
}
