import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { AdminBookingsPanel } from './admin/AdminBookingsPanel';
import { AdminEventTypesPanel } from './admin/AdminEventTypesPanel';

export default function AdminPage() {
  return (
    <div className="bg-app-gradient min-h-[calc(100vh-56px)]">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Админка</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Управление типами событий и бронированиями
          </p>
        </header>

        <Tabs defaultValue="bookings">
          <TabsList variant="line" className="mb-6">
            <TabsTrigger value="bookings">Бронирования</TabsTrigger>
            <TabsTrigger value="event-types">Типы событий</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <AdminBookingsPanel />
          </TabsContent>

          <TabsContent value="event-types">
            <AdminEventTypesPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
