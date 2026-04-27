import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAdminBookings, useCancelBooking } from '@/api/hooks';

dayjs.locale('ru');

export function AdminBookingsPanel() {
  const { data, isLoading, error } = useAdminBookings();
  const cancelBooking = useCancelBooking();

  if (isLoading) {
    return <p className="text-muted-foreground">Загрузка...</p>;
  }
  if (error) {
    return (
      <p className="text-destructive">Не удалось загрузить бронирования.</p>
    );
  }

  const bookings = data?.items ?? [];

  if (bookings.length === 0) {
    return <p className="text-muted-foreground">Бронирований пока нет.</p>;
  }

  const handleCancel = (id: string) => {
    cancelBooking.mutate(id, {
      onSuccess: () => toast.success('Бронирование отменено'),
      onError: (err: Error) =>
        toast.error(err.message || 'Не удалось отменить'),
    });
  };

  return (
    <div className="grid gap-3">
      {bookings.map((b) => (
        <Card key={b.id} className="bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-slate-900">{b.guestName}</p>
              <p className="text-xs text-muted-foreground">{b.guestEmail}</p>
            </div>
            <Badge variant="ghost" className="bg-slate-100 text-slate-700">
              {b.eventType.name}
            </Badge>
            <div className="flex items-center gap-2 text-sm">
              <span>{dayjs(b.startTime).format('D MMM YYYY HH:mm')}</span>
              <span className="text-muted-foreground">→</span>
              <span>{dayjs(b.endTime).format('HH:mm')}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCancel(b.id)}
              disabled={cancelBooking.isPending}
            >
              Отменить
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
