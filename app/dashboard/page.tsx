import { Suspense } from "react";
import { EventsList } from "@/components/events/events-list";
import { EventsHeader } from "@/components/events/events-header";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardPageProps {
  searchParams: Promise<{
    search?: string;
    sport?: string;
  }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-slate-50">
      <EventsHeader />
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<EventsListSkeleton />}>
          <EventsList searchQuery={params.search} sportFilter={params.sport} />
        </Suspense>
      </main>
    </div>
  );
}

function EventsListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="ml-auto h-10 w-32" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    </div>
  );
}
