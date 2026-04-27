import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ru';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

dayjs.locale('ru');

const MONTHS_RU = [
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь',
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

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <Card className="flex-1 min-w-[280px] bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-base font-semibold text-slate-900">Календарь</h4>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon-xs"
            onClick={onPrevMonth}
            aria-label="Предыдущий месяц"
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-xs"
            onClick={onNextMonth}
            aria-label="Следующий месяц"
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">
        {MONTHS_RU[currentDate.month()]} {currentDate.year()} г.
      </p>
      <div className="grid grid-cols-7 gap-1">
        {DAYS_RU.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-xs font-semibold text-muted-foreground"
          >
            {d}
          </div>
        ))}
        {cells.map((day, idx) => {
          if (day === null) return <div key={idx} />;
          const dateStr = currentDate.date(day).format('YYYY-MM-DD');
          const info = slotsByDate[dateStr];
          const isSelected = selectedDate === dateStr;
          return (
            <button
              type="button"
              key={idx}
              data-testid={`calendar-day-${dateStr}`}
              onClick={() => onSelectDate(dateStr)}
              className={cn(
                'flex min-h-[48px] flex-col items-center justify-center rounded-lg border-2 px-1 py-2 transition-all',
                isSelected
                  ? 'border-orange-500 bg-orange-50 text-orange-600'
                  : 'border-transparent bg-slate-100 hover:bg-slate-200',
              )}
            >
              <span
                className={cn(
                  'text-sm',
                  isSelected ? 'font-bold' : 'font-medium',
                )}
              >
                {day}
              </span>
              {info && (
                <span className="text-xs opacity-70">{info.available} св.</span>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
