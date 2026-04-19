import { useEffect, useState } from 'react';
import { publicApi } from '@/api/client';
import type { EventType } from '@/types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Loader2 } from 'lucide-react';

interface EventTypeListProps {
  onSelect: (eventType: EventType) => void;
}

export function EventTypeList({ onSelect }: EventTypeListProps) {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    publicApi
      .listEventTypes()
      .then((res) => setEventTypes(res.items))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        <p>Failed to load event types</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (eventTypes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No event types available yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {eventTypes.map((et) => (
        <Card
          key={et.id}
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => onSelect(et)}
        >
          <CardHeader>
            <CardTitle className="text-lg">{et.name}</CardTitle>
            <CardDescription>{et.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="gap-1">
              <Clock className="size-3" />
              {et.durationMinutes} min
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
