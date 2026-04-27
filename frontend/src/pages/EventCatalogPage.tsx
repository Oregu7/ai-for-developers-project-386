import { Link } from 'react-router-dom';
import { ArrowRightIcon, ClockIcon } from 'lucide-react';
import { HostAvatar } from '@/components/HostAvatar';
import { useEventTypes } from '@/api/hooks';

function LoadingState() {
  return (
    <div className="bg-app-gradient min-h-[calc(100vh-56px)]">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-border/60 bg-white/60"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EventCatalogPage() {
  const { data, isLoading, error } = useEventTypes();

  if (isLoading) return <LoadingState />;

  if (error) {
    return (
      <div className="bg-app-gradient min-h-[calc(100vh-56px)]">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <p className="text-destructive">Не удалось загрузить типы событий.</p>
        </div>
      </div>
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="bg-app-gradient min-h-[calc(100vh-56px)]">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8 flex items-center gap-4">
          <HostAvatar size={52} />
          <div>
            <p className="text-lg font-bold text-foreground">Tota</p>
            <p className="text-sm text-muted-foreground">Host · Calendar</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            Выберите тип события
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Нажмите на карточку, чтобы открыть календарь и выбрать удобный слот.
          </p>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {items.map((et) => (
              <Link
                key={et.id}
                to={`/book/${et.id}`}
                data-testid={`event-type-${et.id}`}
                className="group block"
              >
                <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/40">
                  <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-gradient-to-b from-primary to-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-foreground">
                        {et.name}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {et.description}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
                        <ClockIcon className="size-3" />
                        {et.durationMinutes} мин
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Выбрать время <ArrowRightIcon className="size-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-white/50 py-16 text-center">
            <p className="text-muted-foreground">Нет доступных типов событий.</p>
          </div>
        )}
      </div>
    </div>
  );
}
