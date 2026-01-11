import { EventForm } from "@/components/events/event-form";
import { EventsHeader } from "@/components/events/events-header";
import { getEvent } from "@/app/dashboard/actions";
import { notFound, redirect } from "next/navigation";

interface EditEventPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const result = await getEvent(id);

  if (!result.success) {
    if (result.error === "Not authenticated") {
      redirect("/auth/login");
    }
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <EventsHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Event</h1>
          <p className="mt-2 text-muted-foreground">
            Update the details of your event
          </p>
        </div>
        <div className="max-w-3xl">
          <EventForm mode="edit" event={result.data} />
        </div>
      </main>
    </div>
  );
}
