import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { toast } from 'sonner';
import { ArrowLeftIcon, CheckIcon, ClockIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      .filter((s) => dayjs(s.startTime).format('YYYY-MM-DD') === selectedDate)
      .sort((a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf());
  }, [slots, selectedDate]);

  const selectedDateFormatted = selectedDate
    ? dayjs(selectedDate)
        .format('dddd, D MMMM')
        .replace(/^./, (c) => c.toUpperCase())
    : '';

  if (eventTypeLoading) {
    return (
      <div className="bg-app-gradient min-h-[calc(100vh-56px)]">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="mt-6 flex gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 flex-1 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!eventType) {
    return (
      <div className="bg-app-gradient min-h-[calc(100vh-56px)]">
        <div className="mx-auto max-w-6xl px-6 py-10">
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
    <div className="bg-app-gradient min-h-[calc(100vh-56px)]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <button
          type="button"
          onClick={() => navigate('/book')}
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          Назад к событиям
        </button>

        <h2 className="mb-6 text-3xl font-bold text-foreground">
          {eventType.name}
        </h2>

        {slotsLoading ? (
          <div className="flex gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 flex-1 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <div className="w-full rounded-2xl border border-border/60 bg-white p-5 shadow-sm lg:w-64 lg:shrink-0">
              <div className="mb-5 flex items-center gap-3">
                <HostAvatar size={40} />
                <div>
                  <p className="text-sm font-semibold text-foreground">Tota</p>
                  <p className="text-xs text-muted-foreground">Host</p>
                </div>
              </div>

              <div className="mb-1 text-base font-semibold text-foreground">
                {eventType.name}
              </div>
              <div className="mb-3 flex items-center gap-1.5">
                <ClockIcon className="size-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {eventType.durationMinutes} минут
                </span>
              </div>
              <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                {eventType.description}
              </p>

              <div className="space-y-2.5">
                <div className="rounded-xl bg-muted/60 px-3.5 py-2.5">
                  <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Дата
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedDateFormatted || '—'}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/60 px-3.5 py-2.5">
                  <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Время
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedSlot
                      ? `${dayjs(selectedSlot.startTime).format('HH:mm')} – ${dayjs(selectedSlot.endTime).format('HH:mm')}`
                      : '—'}
                  </p>
                </div>
              </div>
            </div>

            <CalendarGrid
              currentDate={calendarMonth}
              selectedDate={selectedDate}
              slotsByDate={slotsByDate}
              onSelectDate={(d) => {
                setSelectedDate(d);
                setSelectedSlot(null);
              }}
              onPrevMonth={() => setCalendarMonth((m) => m.subtract(1, 'month'))}
              onNextMonth={() => setCalendarMonth((m) => m.add(1, 'month'))}
            />

            <div className="w-full rounded-2xl border border-border/60 bg-white p-5 shadow-sm lg:w-64 lg:shrink-0">
              <h4 className="mb-4 text-sm font-semibold text-foreground">
                {selectedDate ? selectedDateFormatted : 'Выберите дату'}
              </h4>

              <div className="space-y-2">
                {slotsForDate.length > 0 ? (
                  slotsForDate.map((slot) => {
                    const isSelected = selectedSlot?.startTime === slot.startTime;
                    return (
                      <button
                        type="button"
                        key={slot.startTime}
                        data-testid={`slot-${slot.startTime}`}
                        data-available={slot.isAvailable}
                        onClick={() => slot.isAvailable && setSelectedSlot(slot)}
                        disabled={!slot.isAvailable}
                        className={cn(
                          'flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm transition-all',
                          isSelected
                            ? 'border-primary bg-accent text-accent-foreground shadow-sm shadow-primary/10'
                            : slot.isAvailable
                              ? 'border-border/60 bg-muted/40 hover:border-primary/40 hover:bg-accent/50 cursor-pointer'
                              : 'cursor-not-allowed border-border/40 bg-muted/20 opacity-50',
                        )}
                      >
                        <span className="font-medium">
                          {dayjs(slot.startTime).format('HH:mm')} –{' '}
                          {dayjs(slot.endTime).format('HH:mm')}
                        </span>
                        <span
                          className={cn(
                            'flex items-center gap-1 text-xs font-semibold',
                            isSelected
                              ? 'text-primary'
                              : slot.isAvailable
                                ? 'text-emerald-600'
                                : 'text-muted-foreground',
                          )}
                          data-testid={slot.isAvailable ? 'slot-available' : 'slot-booked'}
                        >
                          {isSelected && <CheckIcon className="size-3" />}
                          {slot.isAvailable ? (isSelected ? 'Выбрано' : 'Свободно') : 'Занято'}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Выберите дату на календаре
                  </p>
                )}
              </div>

              <div className="mt-4 border-t border-border/40 pt-4">
                <Button
                  className="w-full font-semibold text-white shadow-sm shadow-primary/20 disabled:opacity-40"
                  disabled={!selectedSlot}
                  onClick={() => setFormOpen(true)}
                  style={selectedSlot ? {
                    background: 'linear-gradient(135deg, oklch(0.48 0.22 280) 0%, oklch(0.52 0.2 265) 100%)',
                  } : undefined}
                >
                  Продолжить
                </Button>
              </div>
            </div>
          </div>
        )}

        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Данные для записи</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Заполните контактные данные, чтобы подтвердить бронирование.
              </DialogDescription>
            </DialogHeader>
            <form className="flex flex-col gap-4 pt-1" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="booking-guest-name" className="text-sm font-medium">
                  Имя
                </Label>
                <Input
                  id="booking-guest-name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Ваше имя"
                  className="rounded-xl"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="booking-guest-email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="booking-guest-email"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="rounded-xl"
                />
              </div>
              {formError && (
                <p className="text-xs text-destructive">{formError}</p>
              )}
              <Button
                type="submit"
                className="w-full rounded-xl font-semibold text-white shadow-sm shadow-primary/20"
                disabled={createBooking.isPending}
                style={{
                  background: 'linear-gradient(135deg, oklch(0.48 0.22 280) 0%, oklch(0.52 0.2 265) 100%)',
                }}
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
