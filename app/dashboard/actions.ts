"use server";

import { createClient } from "@/lib/supabase/server";
import { ZodError } from "zod";
import { ActionResult } from "@/lib/action-helper";
import { EventWithVenues } from "@/lib/types/database";
import { revalidatePath } from "next/cache";
import { createEventSchema, updateEventSchema } from "@/lib/schemas/event-schemas";

export async function getEvents(
  searchQuery?: string,
  sportFilter?: string
): Promise<ActionResult<EventWithVenues[]>> {
  try {
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
      `
      )
      .eq("user_id", user.id)
      .order("date_time", { ascending: true });

    if (searchQuery) {
      query = query.ilike("name", `%${searchQuery}%`);
    }

    if (sportFilter && sportFilter !== "all") {
      query = query.eq("sport_type", sportFilter);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as EventWithVenues[] };
  } catch (error) {
    console.error("Error fetching events:", error);
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
    console.error("Error fetching event:", error);
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
      console.error("Error creating venues:", venuesError);
      // Note: Supabase JS client doesn't support transactions. Manual rollback here.
      // In production, consider using Postgres functions with BEGIN/COMMIT/ROLLBACK.
      const { error: rollbackError } = await supabase
        .from("events")
        .delete()
        .eq("id", event.id);

      if (rollbackError) {
        console.error("Failed to rollback event creation:", rollbackError);
      }

      return { success: false, error: venuesError.message };
    }

    revalidatePath("/dashboard");
    return { success: true, data: { id: event.id } };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0]?.message || "Validation error" };
    }
    console.error("Error creating event:", error);
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
    console.error("Error updating event:", error);
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
    console.error("Error deleting event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete event"
    };
  }
}
