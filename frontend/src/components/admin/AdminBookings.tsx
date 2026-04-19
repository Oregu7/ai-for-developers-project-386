import { useEffect, useState } from 'react';
import { adminApi } from '@/api/client';
import type { BookingResponse } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Clock, User, Mail, Trash2 } from 'lucide-react';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function AdminBookings() {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = () => {
    setLoading(true);
    adminApi
      .listBookings()
      .then((res) => setBookings(res.items))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await adminApi.cancelBooking(id);
      fetchBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancel failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Bookings</h2>
        <Button variant="outline" size="sm" onClick={fetchBookings}>
          Refresh
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {bookings.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No bookings yet.
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{booking.eventType.name}</CardTitle>
                  <Badge
                    variant={
                      booking.status === 'confirmed' ? 'default' : 'secondary'
                    }
                  >
                    {booking.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-muted-foreground" />
                    <span>{formatDate(booking.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-muted-foreground" />
                    <span>
                      {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="size-4 text-muted-foreground" />
                    <span>{booking.guestName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-muted-foreground" />
                    <span>{booking.guestEmail}</span>
                  </div>
                </div>

                {booking.status === 'confirmed' && (
                  <div className="pt-2">
                    <Button
                      variant="destructive"
                      size="xs"
                      onClick={() => handleCancel(booking.id)}
                    >
                      <Trash2 className="size-3" />
                      Cancel Booking
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
