import { useState } from 'react';
import { publicApi } from '@/api/client';
import type { EventType, SlotResponse, BookingResponse } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Calendar, Clock, User, Mail } from 'lucide-react';

interface BookingFormProps {
  eventType: EventType;
  slot: SlotResponse;
  onBack: () => void;
  onBookingCreated: (booking: BookingResponse) => void;
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

export function BookingForm({ eventType, slot, onBack, onBookingCreated }: BookingFormProps) {
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const booking = await publicApi.createBooking({
        eventTypeId: eventType.id,
        startTime: slot.startTime,
        guestName,
        guestEmail,
      });
      onBookingCreated(booking);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon-sm" onClick={onBack}>
          <ArrowLeft className="size-4" />
        </Button>
        <h2 className="text-xl font-semibold">Book: {eventType.name}</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Selected Slot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="size-4 text-muted-foreground" />
            <span>{formatDate(slot.startTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="size-4 text-muted-foreground" />
            <span>
              {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Duration: {eventType.durationMinutes} min
          </p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="guestName" className="flex items-center gap-2">
            <User className="size-4" />
            Name
          </Label>
          <Input
            id="guestName"
            placeholder="Your name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="guestEmail" className="flex items-center gap-2">
            <Mail className="size-4" />
            Email
          </Label>
          <Input
            id="guestEmail"
            type="email"
            placeholder="your@email.com"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Confirm Booking
        </Button>
      </form>
    </div>
  );
}
