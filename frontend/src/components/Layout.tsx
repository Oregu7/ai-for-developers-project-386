import { Link, NavLink, Outlet } from 'react-router-dom';
import { CalendarDaysIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary shadow-sm">
              <CalendarDaysIcon className="size-4 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Calendar
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink
              to="/book"
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              Записаться
            </NavLink>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
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
