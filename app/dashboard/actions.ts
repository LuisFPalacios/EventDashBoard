"use server";

import { createClient } from "@/lib/supabase/server";
import { ZodError } from "zod";
import { ActionResult } from "@/lib/action-helper";
import { EventWithVenues } from "@/lib/types/database";
import { revalidatePath } from "next/cache";
import { createEventSchema, updateEventSchema, getEventsQuerySchema } from "@/lib/schemas/event-schemas";
import { logger } from "@/lib/logger";

interface PaginatedResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}

export async function getEvents(
  params?: {
    searchQuery?: string;
    sportFilter?: string;
    limit?: number;
    offset?: number;
  }
): Promise<ActionResult<PaginatedResult<EventWithVenues>>> {
  try {
    const validated = getEventsQuerySchema.parse({
      searchQuery: params?.searchQuery || undefined,
      sportFilter: params?.sportFilter || undefined,
      limit: params?.limit || 50,
      offset: params?.offset || 0,
    });

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    let query = supabase
      .from("events")
      .select(
        `
        *,
        venues (*)
      `,
        { count: "exact" }
      )
      .eq("user_id", user.id)
      .order("date_time", { ascending: true })
      .range(validated.offset, validated.offset + validated.limit - 1);

    if (validated.searchQuery) {
      query = query.ilike("name", `%${validated.searchQuery}%`);
    }

    if (validated.sportFilter && validated.sportFilter !== "all") {
      query = query.eq("sport_type", validated.sportFilter);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error("Error fetching events", { error });
      return { success: false, error: error.message };
    }

    const total = count || 0;
    const hasMore = validated.offset + validated.limit < total;

    return {
      success: true,
      data: {
        data: (data as EventWithVenues[]) || [],
        total,
        hasMore,
      },
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0]?.message || "Invalid query parameters" };
    }
    logger.error("Error fetching events", { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch events"
    };
  }
}

export async function getEvent(
  id: string
): Promise<ActionResult<EventWithVenues>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("events")
      .select(
        `
        *,
        venues (*)
      `
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as EventWithVenues };
  } catch (error) {
    logger.error("Error fetching event", { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch event"
    };
  }
}

export async function createEvent(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const validatedInput = createEventSchema.parse(input);
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Create event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        user_id: user.id,
        name: validatedInput.name,
        sport_type: validatedInput.sport_type,
        date_time: validatedInput.date_time,
        description: validatedInput.description || null,
      })
      .select()
      .single();

    if (eventError) {
      return { success: false, error: eventError.message };
    }

    // Create venues
    const venuesData = validatedInput.venues.map((venue) => ({
      event_id: event.id,
      name: venue.name,
      address: venue.address || null,
    }));

    const { error: venuesError } = await supabase
      .from("venues")
      .insert(venuesData);

    if (venuesError) {
      logger.error("Error creating venues", { error: venuesError });
      // Note: Supabase JS client doesn't support transactions. Manual rollback here.
      // In production, consider using Postgres functions with BEGIN/COMMIT/ROLLBACK.
      const { error: rollbackError } = await supabase
        .from("events")
        .delete()
        .eq("id", event.id);

      if (rollbackError) {
        logger.error("Failed to rollback event creation", { error: rollbackError });
      }

      return { success: false, error: venuesError.message };
    }

    revalidatePath("/dashboard");
    return { success: true, data: { id: event.id } };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0]?.message || "Validation error" };
    }
    logger.error("Error creating event", { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create event"
    };
  }
}

export async function updateEvent(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const validatedInput = updateEventSchema.parse(input);
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Update event
    const { error: eventError } = await supabase
      .from("events")
      .update({
        name: validatedInput.name,
        sport_type: validatedInput.sport_type,
        date_time: validatedInput.date_time,
        description: validatedInput.description || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", validatedInput.id)
      .eq("user_id", user.id);

    if (eventError) {
      return { success: false, error: eventError.message };
    }

    // Delete existing venues
    await supabase.from("venues").delete().eq("event_id", validatedInput.id);

    // Create new venues
    const venuesData = validatedInput.venues.map((venue) => ({
      event_id: validatedInput.id,
      name: venue.name,
      address: venue.address || null,
    }));

    const { error: venuesError } = await supabase
      .from("venues")
      .insert(venuesData);

    if (venuesError) {
      return { success: false, error: venuesError.message };
    }

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/events/${validatedInput.id}`);
    return { success: true, data: { id: validatedInput.id } };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0]?.message || "Validation error" };
    }
    logger.error("Error updating event", { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update event"
    };
  }
}

export async function deleteEvent(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error) {
    logger.error("Error deleting event", { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete event"
    };
  }
}
