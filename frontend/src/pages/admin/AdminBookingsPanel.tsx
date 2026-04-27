import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { toast } from 'sonner';
import { CalendarIcon, MailIcon, UserIcon, XCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminBookings, useCancelBooking } from '@/api/hooks';

dayjs.locale('ru');

export function AdminBookingsPanel() {
  const { data, isLoading, error } = useAdminBookings();
  const cancelBooking = useCancelBooking();

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
    return (
      <p className="text-destructive text-sm">Не удалось загрузить бронирования.</p>
    );
  }

  const bookings = data?.items ?? [];

  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white/50 py-16 text-center">
        <p className="text-muted-foreground text-sm">Бронирований пока нет.</p>
      </div>
    );
  }

  const handleCancel = (id: string) => {
    cancelBooking.mutate(id, {
      onSuccess: () => toast.success('Бронирование отменено'),
      onError: (err: Error) => toast.error(err.message || 'Не удалось отменить'),
    });
  };

  return (
    <div className="grid gap-3">
      {bookings.map((b) => (
        <div
          key={b.id}
          className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent">
                <UserIcon className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{b.guestName}</p>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MailIcon className="size-3" />
                  {b.guestEmail}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              {b.eventType.name}
            </div>

            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarIcon className="size-4 text-primary/60" />
              <span>
                {dayjs(b.startTime).format('D MMM YYYY')}
                {' · '}
                {dayjs(b.startTime).format('HH:mm')} – {dayjs(b.endTime).format('HH:mm')}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCancel(b.id)}
              disabled={cancelBooking.isPending}
              className="shrink-0 gap-1.5 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40"
            >
              <XCircleIcon className="size-4" />
              Отменить
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
