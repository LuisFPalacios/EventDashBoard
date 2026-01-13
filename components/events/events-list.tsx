"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
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
import { SPORT_TYPES } from "@/lib/schemas/event-schemas";
import { useDebounce } from "@/lib/hooks/useDebounce";

interface EventsListProps {
  searchQuery?: string;
  sportFilter?: string;
}

export function EventsList({ searchQuery = "", sportFilter = "all" }: EventsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Combined state object to avoid multiple setState calls
  const [listState, setListState] = useState({
    events: [] as EventWithVenues[],
    total: 0,
    hasMore: false,
    isLoading: true,
  });

  const [isPending, startTransition] = useTransition();

  // Local state for search input to prevent loss of focus
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Debounce the search input for URL updates
  const debouncedSearchInput = useDebounce(searchInput, 300);

  // Sync local state with URL params when they change externally
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Update URL when debounced search changes
  useEffect(() => {
    if (debouncedSearchInput !== searchQuery) {
      startTransition(() => {
        const params = new URLSearchParams(searchParams);
        if (debouncedSearchInput) {
          params.set("search", debouncedSearchInput);
        } else {
          params.delete("search");
        }
        router.push(`/dashboard?${params.toString()}`);
      });
    }
  }, [debouncedSearchInput, searchQuery, searchParams, router]);

  // Load events function with useCallback to prevent unnecessary recreations
  const loadEvents = useCallback(async () => {
    setListState(prev => ({ ...prev, isLoading: true }));

    const result = await getEvents({
      searchQuery,
      sportFilter,
      limit: 50,
      offset: 0,
    });

    if (result.success) {
      setListState({
        events: result.data.data,
        total: result.data.total,
        hasMore: result.data.hasMore,
        isLoading: false,
      });
    } else {
      setListState(prev => ({ ...prev, isLoading: false }));
    }
  }, [searchQuery, sportFilter]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleSearch = (value: string) => {
    // Update local state immediately (keeps input responsive)
    setSearchInput(value);
  };

  const handleSportFilter = (value: string) => {
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

  if (listState.isLoading) {
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
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sportFilter} onValueChange={handleSportFilter}>
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

      {listState.events.length === 0 ? (
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
          {listState.events.map((event) => (
            <EventCard key={event.id} event={event} onDelete={loadEvents} />
          ))}
        </div>
      )}
    </div>
  );
}
