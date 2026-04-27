import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="bg-app-gradient min-h-[calc(100vh-60px)]">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <Badge
              variant="ghost"
              className="self-start rounded-full bg-orange-100 px-3 py-1 text-orange-700"
            >
              БЫСТРАЯ ЗАПИСЬ НА ЗВОНОК
            </Badge>
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
              Calendar
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              Забронируйте встречу за минуту: выберите тип события и удобное
              время.
            </p>
            <Button
              size="lg"
              render={<Link to="/book" />}
              className="self-start gap-2 bg-orange-500 px-5 font-semibold text-white hover:bg-orange-600"
            >
              Записаться <ArrowRightIcon className="size-4" />
            </Button>
          </div>

          <Card className="border bg-white/85 p-8 shadow-sm">
            <h3 className="mb-4 text-xl font-semibold">Возможности</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>• Выбор типа события и удобного времени для встречи.</li>
              <li>
                • Быстрое бронирование с подтверждением и дополнительными
                заметками.
              </li>
              <li>
                • Управление типами встреч и просмотр предстоящих записей в
                админке.
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
