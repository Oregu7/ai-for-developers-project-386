import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ru';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

dayjs.locale('ru');

const MONTHS_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];
const DAYS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export interface SlotsByDate {
  [dateKey: string]: { total: number; available: number };
}

export interface CalendarGridProps {
  currentDate: Dayjs;
  selectedDate: string | null;
  slotsByDate: SlotsByDate;
  onSelectDate: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

function getAvailabilityColor(available: number, total: number) {
  if (available === 0) return 'bg-red-50 text-red-400';
  const ratio = available / total;
  if (ratio >= 0.5) return 'bg-emerald-50 text-emerald-600';
  return 'bg-amber-50 text-amber-600';
}

export function CalendarGrid({
  currentDate,
  selectedDate,
  slotsByDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: CalendarGridProps) {
  const startOfMonth = currentDate.startOf('month');
  const endOfMonth = currentDate.endOf('month');
  const startDay = (startOfMonth.day() + 6) % 7;
  const daysInMonth = endOfMonth.date();
  const today = dayjs().format('YYYY-MM-DD');

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="flex-1 min-w-[280px] rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Календарь
      </h3>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h4 className="text-base font-semibold text-foreground">
            {MONTHS_RU[currentDate.month()]}
          </h4>
          <p className="text-xs text-muted-foreground">{currentDate.year()}</p>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onPrevMonth}
            aria-label="Предыдущий месяц"
            className="flex size-7 items-center justify-center rounded-lg border border-border/60 bg-white text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronLeftIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            aria-label="Следующий месяц"
            className="flex size-7 items-center justify-center rounded-lg border border-border/60 bg-white text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronRightIcon className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS_RU.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) return <div key={idx} />;
          const dateStr = currentDate.date(day).format('YYYY-MM-DD');
          const info = slotsByDate[dateStr];
          const isSelected = selectedDate === dateStr;
          const isToday = dateStr === today;

          return (
            <button
              type="button"
              key={idx}
              data-testid={`calendar-day-${dateStr}`}
              onClick={() => onSelectDate(dateStr)}
              className={cn(
                'relative flex min-h-[44px] flex-col items-center justify-center rounded-xl px-1 py-1.5 text-sm transition-all',
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                  : 'text-foreground hover:bg-muted',
                isToday && !isSelected && 'font-bold ring-1 ring-primary/40',
              )}
            >
              <span className={cn('leading-none', isSelected ? 'font-bold' : 'font-medium')}>
                {day}
              </span>
              {info && !isSelected && (
                <span
                  className={cn(
                    'mt-0.5 rounded-full px-1 text-[9px] font-semibold leading-none',
                    getAvailabilityColor(info.available, info.total),
                  )}
                >
                  {info.available} св.
                </span>
              )}
              {info && isSelected && (
                <span className="mt-0.5 text-[9px] font-semibold leading-none text-primary-foreground/70">
                  {info.available} св.
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-4 border-t border-border/40 pt-3">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-400" />
          <span className="text-[11px] text-muted-foreground">Много слотов</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-amber-400" />
          <span className="text-[11px] text-muted-foreground">Мало слотов</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-red-400" />
          <span className="text-[11px] text-muted-foreground">Нет слотов</span>
        </div>
      </div>
    </div>
  );
}
