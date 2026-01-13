"use client";

import { useEffect, useState, useTransition } from "react";
import { getEvents } from "@/app/dashboard/actions";
import { EventWithVenues } from "@/lib/types/database";
import { EventCard } from "./event-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

const SPORT_TYPES = [
  "Soccer",
  "Basketball",
  "Tennis",
  "Baseball",
  "Football",
  "Volleyball",
  "Hockey",
  "Other",
];

interface EventsListProps {
  searchQuery?: string;
  sportFilter?: string;
}

export function EventsList({ searchQuery = "", sportFilter = "all" }: EventsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<EventWithVenues[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchQuery);
  const [sport, setSport] = useState(sportFilter);

  useEffect(() => {
    let isMounted = true;

    const loadEvents = async () => {
      setIsLoading(true);
      const result = await getEvents({
        searchQuery,
        sportFilter,
        limit: 50,
        offset: 0,
      });
      if (isMounted) {
        if (result.success) {
          setEvents(result.data.data);
          setTotal(result.data.total);
          setHasMore(result.data.hasMore);
        }
        setIsLoading(false);
      }
    };

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, [searchQuery, sportFilter]);

  const loadEvents = async () => {
    setIsLoading(true);
    const result = await getEvents({
      searchQuery,
      sportFilter,
      limit: 50,
      offset: 0,
    });
    if (result.success) {
      setEvents(result.data.data);
      setTotal(result.data.total);
      setHasMore(result.data.hasMore);
    }
    setIsLoading(false);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      router.push(`/dashboard?${params.toString()}`);
    });
  };

  const handleSportFilter = (value: string) => {
    setSport(value);
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (value && value !== "all") {
        params.set("sport", value);
      } else {
        params.delete("sport");
      }
      router.push(`/dashboard?${params.toString()}`);
    });
  };

  if (isLoading) {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sport} onValueChange={handleSportFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by sport" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sports</SelectItem>
            {SPORT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button asChild>
          <Link href="/dashboard/events/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      {isPending && (
        <div className="text-center text-sm text-muted-foreground">
          Loading...
        </div>
      )}

      {events.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-semibold">No events found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchQuery || sportFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by creating your first event"}
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/events/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} onDelete={loadEvents} />
          ))}
        </div>
      )}
    </div>
  );
}
