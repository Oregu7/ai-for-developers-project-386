import { useState } from 'react';
import type { EventType, SlotResponse, BookingResponse } from '@/types/api';
import { EventTypeList } from '@/components/public/EventTypeList';
import { SlotPicker } from '@/components/public/SlotPicker';
import { BookingForm } from '@/components/public/BookingForm';
import { BookingConfirmation } from '@/components/public/BookingConfirmation';
import { AdminEventTypes } from '@/components/admin/AdminEventTypes';
import { AdminBookings } from '@/components/admin/AdminBookings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Settings } from 'lucide-react';

type PublicStep = 'event-types' | 'slots' | 'booking-form' | 'confirmation';

export default function App() {
  const [tab, setTab] = useState('public');

  // Public flow state
  const [step, setStep] = useState<PublicStep>('event-types');
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotResponse | null>(null);
  const [createdBooking, setCreatedBooking] = useState<BookingResponse | null>(null);

  const resetPublicFlow = () => {
    setStep('event-types');
    setSelectedEventType(null);
    setSelectedSlot(null);
    setCreatedBooking(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Calendar Booking</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="public" className="gap-2">
              <Calendar className="size-4" />
              Book a Slot
            </TabsTrigger>
            <TabsTrigger value="admin" className="gap-2">
              <Settings className="size-4" />
              Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="public">
            {step === 'event-types' && (
              <EventTypeList
                onSelect={(et) => {
                  setSelectedEventType(et);
                  setStep('slots');
                }}
              />
            )}

            {step === 'slots' && selectedEventType && (
              <SlotPicker
                eventType={selectedEventType}
                onBack={() => setStep('event-types')}
                onSelectSlot={(slot) => {
                  setSelectedSlot(slot);
                  setStep('booking-form');
                }}
              />
            )}

            {step === 'booking-form' && selectedEventType && selectedSlot && (
              <BookingForm
                eventType={selectedEventType}
                slot={selectedSlot}
                onBack={() => setStep('slots')}
                onBookingCreated={(booking) => {
                  setCreatedBooking(booking);
                  setStep('confirmation');
                }}
              />
            )}

            {step === 'confirmation' && createdBooking && (
              <BookingConfirmation
                booking={createdBooking}
                onNewBooking={resetPublicFlow}
              />
            )}
          </TabsContent>

          <TabsContent value="admin">
            <div className="space-y-8">
              <AdminEventTypes />
              <AdminBookings />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
