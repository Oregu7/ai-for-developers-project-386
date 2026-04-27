import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { HostAvatar } from '@/components/HostAvatar';
import { useEventTypes } from '@/api/hooks';

export default function EventCatalogPage() {
  const { data, isLoading, error } = useEventTypes();

  if (isLoading) {
    return (
      <div className="bg-app-gradient min-h-[calc(100vh-60px)]">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-app-gradient min-h-[calc(100vh-60px)]">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <p className="text-destructive">
            Не удалось загрузить типы событий.
          </p>
        </div>
      </div>
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="bg-app-gradient min-h-[calc(100vh-60px)]">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Card className="mb-6 bg-white p-6">
          <div className="mb-4 flex items-start gap-4">
            <HostAvatar />
            <div>
              <p className="text-lg font-bold text-slate-900">Tota</p>
              <p className="text-sm text-muted-foreground">Host</p>
            </div>
          </div>
          <h2 className="mb-1 text-2xl font-bold text-slate-900">
            Выберите тип события
          </h2>
          <p className="text-sm text-muted-foreground">
            Нажмите на карточку, чтобы открыть календарь и выбрать удобный слот.
          </p>
        </Card>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {items.map((et) => (
              <Link
                key={et.id}
                to={`/book/${et.id}`}
                data-testid={`event-type-${et.id}`}
                className="block"
              >
                <Card className="bg-white p-5 transition-colors hover:border-slate-300">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-bold text-slate-900">
                        {et.name}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {et.description}
                      </p>
                    </div>
                    <Badge
                      variant="ghost"
                      className="bg-slate-100 text-slate-600"
                    >
                      {et.durationMinutes} мин
                    </Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Нет доступных типов событий.</p>
        )}
      </div>
    </div>
  );
}
