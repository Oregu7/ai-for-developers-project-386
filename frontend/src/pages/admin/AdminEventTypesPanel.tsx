import { useState, type FormEvent } from 'react';
import { ClockIcon, Pencil, PlusIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
          onError: (err: Error) => toast.error(err.message || 'Не удалось обновить'),
        },
      );
    } else {
      createEt.mutate(form, {
        onSuccess: () => {
          toast.success('Тип события создан');
          setOpen(false);
        },
        onError: (err: Error) => toast.error(err.message || 'Не удалось создать'),
      });
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Удалить тип события?')) return;
    deleteEt.mutate(id, {
      onSuccess: () => toast.success('Тип события удалён'),
      onError: (err: Error) => toast.error(err.message || 'Не удалось удалить'),
    });
  };

  if (isLoading) {
    return (
      <div className="grid gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl border border-border/60 bg-white" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive text-sm">Не удалось загрузить типы событий.</p>;
  }

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          Всего: {items.length}
        </p>
        <Button
          size="sm"
          onClick={openCreate}
          className="gap-1.5 rounded-xl font-semibold text-white shadow-sm shadow-primary/20"
          style={{
            background: 'linear-gradient(135deg, oklch(0.48 0.22 280) 0%, oklch(0.52 0.2 265) 100%)',
          }}
        >
          <PlusIcon className="size-4" />
          Добавить
        </Button>
      </div>

      {items.length > 0 ? (
        <div className="grid gap-3">
          {items.map((et) => (
            <div
              key={et.id}
              className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{et.name}</p>
                  <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                    {et.description}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
                  <ClockIcon className="size-3" />
                  {et.durationMinutes} мин
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(et)}
                    aria-label="Редактировать"
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(et.id)}
                    disabled={deleteEt.isPending}
                    aria-label="Удалить"
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-white/50 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Типов событий пока нет.{' '}
            <button
              type="button"
              onClick={openCreate}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Создайте первый
            </button>
          </p>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingId ? 'Редактировать тип события' : 'Создать тип события'}
            </DialogTitle>
          </DialogHeader>
          <form className="flex flex-col gap-4 pt-1" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="et-name" className="text-sm font-medium">
                Название
              </Label>
              <Input
                id="et-name"
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                placeholder="Встреча 30 мин"
                className="rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="et-description" className="text-sm font-medium">
                Описание
              </Label>
              <Textarea
                id="et-description"
                value={form.description}
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                placeholder="Краткое описание"
                className="rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="et-duration" className="text-sm font-medium">
                Длительность (мин)
              </Label>
              <Input
                id="et-duration"
                type="number"
                min={5}
                max={480}
                value={form.durationMinutes}
                onChange={(e) =>
                  setForm((s) => ({ ...s, durationMinutes: Number(e.target.value) }))
                }
                className="rounded-xl"
              />
            </div>
            {formError && (
              <p className="text-xs text-destructive">{formError}</p>
            )}
            <Button
              type="submit"
              className="w-full rounded-xl font-semibold text-white shadow-sm shadow-primary/20"
              disabled={createEt.isPending || updateEt.isPending}
              style={{
                background: 'linear-gradient(135deg, oklch(0.48 0.22 280) 0%, oklch(0.52 0.2 265) 100%)',
              }}
            >
              {editingId ? 'Сохранить изменения' : 'Создать'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
