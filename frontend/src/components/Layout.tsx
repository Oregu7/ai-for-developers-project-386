import { Link, NavLink, Outlet } from 'react-router-dom';
import { CalendarDaysIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-15 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <CalendarDaysIcon className="size-5 text-orange-500" />
            <span className="text-base font-bold">Calendar</span>
          </Link>
          <nav className="flex items-center gap-6">
            <NavLink
              to="/book"
              className={({ isActive }) =>
                cn(
                  'text-sm transition-colors',
                  isActive
                    ? 'text-orange-500 font-medium'
                    : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              Записаться
            </NavLink>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                cn(
                  'text-sm transition-colors',
                  isActive
                    ? 'text-orange-500 font-medium'
                    : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              Админка
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
