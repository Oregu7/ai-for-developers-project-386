import { useEffect, useState } from 'react';
import { publicApi } from '@/api/client';
import type { EventType, SlotResponse } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, Loader2, ArrowLeft } from 'lucide-react';

interface SlotPickerProps {
  eventType: EventType;
  onBack: () => void;
  onSelectSlot: (slot: SlotResponse, eventType: EventType) => void;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

export function SlotPicker({ eventType, onBack, onSelectSlot }: SlotPickerProps) {
  const [slots, setSlots] = useState<SlotResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date().toISOString();
    const toDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    publicApi
      .getAvailableSlots(eventType.id, now, toDate)
      .then((res) => setSlots(res.slots.filter((s) => s.isAvailable)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [eventType.id]);

  const slotsByDate = slots.reduce<Record<string, SlotResponse[]>>((acc, slot) => {
    const date = formatDate(slot.startTime);
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon-sm" onClick={onBack}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">{eventType.name}</h2>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="size-4" />
            <span>{eventType.durationMinutes} min</span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-destructive">
          <p>Failed to load slots</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      )}

      {!loading && slots.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No available slots in the next 14 days.
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(slotsByDate).map(([date, dateSlots]) => (
          <div key={date}>
            <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
              <Calendar className="size-4" />
              {date}
            </h3>
            <div className="flex flex-wrap gap-2">
              {dateSlots.map((slot) => (
                <Button
                  key={slot.startTime}
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectSlot(slot, eventType)}
                >
                  {formatTime(slot.startTime)}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
