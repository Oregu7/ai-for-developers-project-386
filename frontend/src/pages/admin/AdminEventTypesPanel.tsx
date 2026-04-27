import { useState, type FormEvent } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  useAdminEventTypes,
  useCreateEventType,
  useDeleteEventType,
  useUpdateEventType,
} from '@/api/hooks';
import type { EventType } from '@/types/api';

interface FormState {
  name: string;
  description: string;
  durationMinutes: number;
}

const empty: FormState = { name: '', description: '', durationMinutes: 30 };

export function AdminEventTypesPanel() {
  const { data, isLoading, error } = useAdminEventTypes();
  const createEt = useCreateEventType();
  const updateEt = useUpdateEventType();
  const deleteEt = useDeleteEventType();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [formError, setFormError] = useState<string | null>(null);

  const items = data?.items ?? [];

  const openCreate = () => {
    setEditingId(null);
    setForm(empty);
    setFormError(null);
    setOpen(true);
  };

  const openEdit = (et: EventType) => {
    setEditingId(et.id);
    setForm({
      name: et.name,
      description: et.description,
      durationMinutes: et.durationMinutes,
    });
    setFormError(null);
    setOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.name.trim()) {
      setFormError('Название обязательно');
      return;
    }
    if (form.durationMinutes < 5) {
      setFormError('Длительность не меньше 5 минут');
      return;
    }

    if (editingId) {
      updateEt.mutate(
        { id: editingId, data: form },
        {
          onSuccess: () => {
            toast.success('Тип события обновлён');
            setOpen(false);
          },
          onError: (err: Error) =>
            toast.error(err.message || 'Не удалось обновить'),
        },
      );
    } else {
      createEt.mutate(form, {
        onSuccess: () => {
          toast.success('Тип события создан');
          setOpen(false);
        },
        onError: (err: Error) =>
          toast.error(err.message || 'Не удалось создать'),
      });
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Удалить тип события?')) return;
    deleteEt.mutate(id, {
      onSuccess: () => toast.success('Тип события удалён'),
      onError: (err: Error) =>
        toast.error(err.message || 'Не удалось удалить'),
    });
  };

  if (isLoading) {
    return <p className="text-muted-foreground">Загрузка...</p>;
  }
  if (error) {
    return <p className="text-destructive">Не удалось загрузить.</p>;
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="font-medium">Типы событий ({items.length})</p>
        <Button
          className="bg-orange-500 text-white hover:bg-orange-600"
          onClick={openCreate}
        >
          Добавить
        </Button>
      </div>

      {items.length > 0 ? (
        <div className="grid gap-3">
          {items.map((et) => (
            <Card key={et.id} className="bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{et.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {et.description}
                  </p>
                </div>
                <Badge variant="ghost" className="bg-slate-100 text-slate-600">
                  {et.durationMinutes} мин
                </Badge>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEdit(et)}
                    aria-label="Редактировать"
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(et.id)}
                    disabled={deleteEt.isPending}
                    aria-label="Удалить"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">
          Типов событий пока нет. Создайте первый.
        </p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Редактировать тип события' : 'Создать тип события'}
            </DialogTitle>
          </DialogHeader>
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="et-name">Название</Label>
              <Input
                id="et-name"
                value={form.name}
                onChange={(e) =>
                  setForm((s) => ({ ...s, name: e.target.value }))
                }
                placeholder="Встреча 30 мин"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="et-description">Описание</Label>
              <Textarea
                id="et-description"
                value={form.description}
                onChange={(e) =>
                  setForm((s) => ({ ...s, description: e.target.value }))
                }
                placeholder="Краткое описание"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="et-duration">Длительность (мин)</Label>
              <Input
                id="et-duration"
                type="number"
                min={5}
                max={480}
                value={form.durationMinutes}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    durationMinutes: Number(e.target.value),
                  }))
                }
              />
            </div>
            {formError && (
              <p className="text-xs text-destructive">{formError}</p>
            )}
            <Button
              type="submit"
              className="bg-orange-500 font-semibold text-white hover:bg-orange-600"
              disabled={createEt.isPending || updateEt.isPending}
            >
              {editingId ? 'Сохранить' : 'Создать'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
