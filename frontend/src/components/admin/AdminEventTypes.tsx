import { useEffect, useState } from 'react';
import { adminApi } from '@/api/client';
import type { EventType, EventTypeCreateRequest, EventTypeUpdateRequest } from '@/types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Clock, Loader2, Plus, Pencil, Trash2 } from 'lucide-react';

export function AdminEventTypes() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EventType | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEventTypes = () => {
    adminApi
      .listEventTypes()
      .then((res) => setEventTypes(res.items))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEventTypes();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setDurationMinutes('');
    setDialogOpen(true);
  };

  const openEdit = (et: EventType) => {
    setEditing(et);
    setName(et.name);
    setDescription(et.description);
    setDurationMinutes(String(et.durationMinutes));
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editing) {
        const data: EventTypeUpdateRequest = {};
        if (name !== editing.name) data.name = name;
        if (description !== editing.description) data.description = description;
        if (Number(durationMinutes) !== editing.durationMinutes)
          data.durationMinutes = Number(durationMinutes);
        await adminApi.updateEventType(editing.id, data);
      } else {
        const data: EventTypeCreateRequest = {
          name,
          description,
          durationMinutes: Number(durationMinutes),
        };
        await adminApi.createEventType(data);
      }
      setDialogOpen(false);
      fetchEventTypes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event type?')) return;
    try {
      await adminApi.deleteEventType(id);
      fetchEventTypes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
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
        <h2 className="text-xl font-semibold">Event Types</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button size="sm" onClick={openCreate} />}>
            <Plus className="size-4" />
            Create
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Event Type' : 'Create Event Type'}</DialogTitle>
              <DialogDescription>
                {editing ? 'Update the event type details.' : 'Add a new event type for booking.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="et-name">Name</Label>
                <Input
                  id="et-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Consultation"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="et-desc">Description</Label>
                <Textarea
                  id="et-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the event type..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="et-duration">Duration (minutes)</Label>
                <Input
                  id="et-duration"
                  type="number"
                  min={5}
                  max={480}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {editing ? 'Update' : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {eventTypes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No event types created yet. Click "Create" to add one.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {eventTypes.map((et) => (
            <Card key={et.id}>
              <CardHeader>
                <CardTitle className="text-lg">{et.name}</CardTitle>
                <CardDescription>{et.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="size-3" />
                    {et.durationMinutes} min
                  </Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-xs" onClick={() => openEdit(et)}>
                      <Pencil className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleDelete(et.id)}
                    >
                      <Trash2 className="size-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
