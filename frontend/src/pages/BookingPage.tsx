import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HostAvatar } from '@/components/HostAvatar';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { useCreateBooking, useEventType, useSlots } from '@/api/hooks';
import { cn } from '@/lib/utils';
import type { SlotResponse } from '@/types/api';

dayjs.locale('ru');

interface InfoBoxProps {
  label: string;
  value: string;
}

function InfoBox({ label, value }: InfoBoxProps) {
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-2.5">
      <p className="mb-0.5 text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

export default function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotResponse | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(dayjs());
  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  const { data: eventType, isLoading: eventTypeLoading } = useEventType(id);
  const { data: slotsResp, isLoading: slotsLoading } = useSlots(id);
  const createBooking = useCreateBooking();

  const slots = slotsResp?.slots ?? [];

  const slotsByDate = useMemo(() => {
    return slots.reduce<Record<string, { total: number; available: number }>>(
      (acc, slot) => {
        const key = dayjs(slot.startTime).format('YYYY-MM-DD');
        if (!acc[key]) acc[key] = { total: 0, available: 0 };
        acc[key].total++;
        if (slot.isAvailable) acc[key].available++;
        return acc;
      },
      {},
    );
  }, [slots]);

  const slotsForDate = useMemo(() => {
    if (!selectedDate) return [];
    return slots
      .filter(
        (s) => dayjs(s.startTime).format('YYYY-MM-DD') === selectedDate,
      )
      .sort(
        (a, b) =>
          dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf(),
      );
  }, [slots, selectedDate]);

  const selectedDateFormatted = selectedDate
    ? dayjs(selectedDate)
        .format('dddd, D MMMM')
        .replace(/^./, (c) => c.toUpperCase())
    : '';

  if (eventTypeLoading) {
    return (
      <div className="bg-app-gradient min-h-[calc(100vh-60px)]">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!eventType) {
    return (
      <div className="bg-app-gradient min-h-[calc(100vh-60px)]">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <p className="text-destructive">Тип события не найден.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!guestName.trim()) {
      setFormError('Имя обязательно');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(guestEmail)) {
      setFormError('Некорректный email');
      return;
    }
    if (!selectedSlot || !id) return;

    createBooking.mutate(
      {
        eventTypeId: id,
        startTime: selectedSlot.startTime,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
      },
      {
        onSuccess: () => {
          toast.success('Встреча забронирована!');
          setFormOpen(false);
          setGuestName('');
          setGuestEmail('');
          navigate('/book');
        },
        onError: (err: Error) => {
          toast.error(err.message || 'Не удалось забронировать');
        },
      },
    );
  };

  return (
    <div className="bg-app-gradient min-h-[calc(100vh-60px)]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="mb-8 text-3xl font-bold text-slate-900">
          {eventType.name}
        </h2>

        {slotsLoading ? (
          <p className="text-muted-foreground">Загрузка слотов...</p>
        ) : (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <Card className="w-full bg-white p-5 lg:w-72 lg:shrink-0">
              <div className="mb-4 flex items-center gap-3">
                <HostAvatar size={40} />
                <div>
                  <p className="font-bold text-slate-900">Tota</p>
                  <p className="text-xs text-muted-foreground">Host</p>
                </div>
              </div>
              <div className="mb-3 flex items-center gap-2">
                <p className="font-bold text-slate-900">{eventType.name}</p>
                <Badge variant="ghost" className="bg-slate-100 text-slate-600">
                  {eventType.durationMinutes} мин
                </Badge>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                {eventType.description}
              </p>
              <div className="space-y-2.5">
                <InfoBox
                  label="Выбранная дата"
                  value={selectedDateFormatted || '—'}
                />
                <InfoBox
                  label="Выбранное время"
                  value={
                    selectedSlot
                      ? `${dayjs(selectedSlot.startTime).format('HH:mm')} – ${dayjs(selectedSlot.endTime).format('HH:mm')}`
                      : 'Время не выбрано'
                  }
                />
              </div>
            </Card>

            <CalendarGrid
              currentDate={calendarMonth}
              selectedDate={selectedDate}
              slotsByDate={slotsByDate}
              onSelectDate={(d) => {
                setSelectedDate(d);
                setSelectedSlot(null);
              }}
              onPrevMonth={() =>
                setCalendarMonth((m) => m.subtract(1, 'month'))
              }
              onNextMonth={() => setCalendarMonth((m) => m.add(1, 'month'))}
            />

            <Card className="w-full bg-white p-5 lg:w-72 lg:shrink-0">
              <h4 className="mb-4 text-base font-semibold text-slate-900">
                Статус слотов
              </h4>
              <div className="space-y-2">
                {slotsForDate.length > 0 ? (
                  slotsForDate.map((slot) => {
                    const isSelected =
                      selectedSlot?.startTime === slot.startTime;
                    return (
                      <button
                        type="button"
                        key={slot.startTime}
                        data-testid={`slot-${slot.startTime}`}
                        data-available={slot.isAvailable}
                        onClick={() =>
                          slot.isAvailable && setSelectedSlot(slot)
                        }
                        disabled={!slot.isAvailable}
                        className={cn(
                          'flex w-full items-center justify-between rounded-lg border px-3 py-2 transition-all',
                          isSelected
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-slate-200 bg-slate-100',
                          slot.isAvailable
                            ? 'cursor-pointer hover:border-slate-300'
                            : 'cursor-not-allowed opacity-60',
                        )}
                      >
                        <span
                          className={cn(
                            'text-sm font-medium',
                            slot.isAvailable
                              ? 'text-slate-900'
                              : 'text-muted-foreground',
                          )}
                        >
                          {dayjs(slot.startTime).format('HH:mm')} –{' '}
                          {dayjs(slot.endTime).format('HH:mm')}
                        </span>
                        <span
                          className={cn(
                            'text-xs font-semibold',
                            slot.isAvailable
                              ? 'text-slate-900'
                              : 'text-muted-foreground',
                          )}
                          data-testid={
                            slot.isAvailable ? 'slot-available' : 'slot-booked'
                          }
                        >
                          {slot.isAvailable ? 'Свободно' : 'Занято'}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Выберите дату
                  </p>
                )}
              </div>
              <hr className="my-4 border-slate-200" />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 font-semibold"
                  onClick={() => navigate('/book')}
                >
                  Назад
                </Button>
                <Button
                  className="flex-1 bg-orange-500 font-semibold text-white hover:bg-orange-600"
                  disabled={!selectedSlot}
                  onClick={() => setFormOpen(true)}
                >
                  Продолжить
                </Button>
              </div>
            </Card>
          </div>
        )}

        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Данные для записи</DialogTitle>
              <DialogDescription>
                Заполните контактные данные, чтобы подтвердить бронирование.
              </DialogDescription>
            </DialogHeader>
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="booking-guest-name">Имя</Label>
                <Input
                  id="booking-guest-name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Ваше имя"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="booking-guest-email">Email</Label>
                <Input
                  id="booking-guest-email"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              {formError && (
                <p className="text-xs text-destructive">{formError}</p>
              )}
              <Button
                type="submit"
                className="bg-orange-500 font-semibold text-white hover:bg-orange-600"
                disabled={createBooking.isPending}
              >
                {createBooking.isPending ? 'Бронируем...' : 'Забронировать'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
