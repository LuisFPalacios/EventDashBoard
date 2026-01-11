import { EventForm } from "@/components/events/event-form";
import { EventsHeader } from "@/components/events/events-header";

export default function CreateEventPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <EventsHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Create New Event</h1>
          <p className="mt-2 text-muted-foreground">
            Fill in the details to create a new sports event
          </p>
        </div>
        <div className="max-w-3xl">
          <EventForm mode="create" />
        </div>
      </main>
    </div>
  );
}
