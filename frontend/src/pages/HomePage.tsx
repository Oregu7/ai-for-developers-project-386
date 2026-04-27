import { Link } from 'react-router-dom';
import { ArrowRightIcon, CalendarCheckIcon, ClockIcon, ZapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: CalendarCheckIcon,
    title: 'Умный календарь',
    description: 'Выбирайте дату и время из актуальных свободных слотов.',
  },
  {
    icon: ZapIcon,
    title: 'Мгновенное бронирование',
    description: 'Подтвердите встречу в несколько кликов без лишних шагов.',
  },
  {
    icon: ClockIcon,
    title: 'Гибкие типы встреч',
    description: 'Разные форматы и длительности — под любую задачу.',
  },
];

export default function HomePage() {
  return (
    <div className="bg-app-gradient min-h-[calc(100vh-56px)]">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-20 flex flex-col items-center text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-4 py-1.5 text-xs font-semibold tracking-wide text-accent-foreground uppercase">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            Быстрая запись на встречу
          </div>

          <h1 className="mb-5 max-w-2xl text-5xl font-extrabold tracking-tight text-foreground lg:text-6xl">
            Записывайтесь на встречи{' '}
            <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
              быстро и удобно
            </span>
          </h1>

          <p className="mb-8 max-w-lg text-lg text-muted-foreground">
            Выберите тип события, дату и время — и ваша встреча будет
            забронирована за считанные секунды.
          </p>

          <Button
            size="lg"
            render={<Link to="/book" />}
            className="gap-2 rounded-xl px-7 py-3 text-sm font-semibold text-white shadow-md shadow-primary/30 hover:shadow-lg hover:shadow-primary/40 transition-all"
            style={{
              background: 'linear-gradient(135deg, oklch(0.48 0.22 280) 0%, oklch(0.52 0.2 265) 100%)',
            }}
          >
            Записаться <ArrowRightIcon className="size-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-2xl border border-border/60 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-all hover:shadow-md hover:border-primary/30"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-accent">
                <Icon className="size-5 text-primary" />
              </div>
              <h3 className="mb-1.5 text-sm font-semibold text-foreground">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
