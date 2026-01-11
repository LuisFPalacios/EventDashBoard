"use server";

import { createClient } from "@/lib/supabase/server";
import { z, ZodError } from "zod";
import { ActionResult } from "@/lib/action-helper";
import { EventWithVenues } from "@/lib/types/database";
import { revalidatePath } from "next/cache";

const venueSchema = z.object({
  name: z.string().min(1, "Venue name is required"),
  address: z.string().optional(),
});

const createEventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  sport_type: z.string().min(1, "Sport type is required"),
  date_time: z.string().min(1, "Date and time are required"),
  description: z.string().optional(),
  venues: z.array(venueSchema).min(1, "At least one venue is required"),
});

const updateEventSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Event name is required"),
  sport_type: z.string().min(1, "Sport type is required"),
  date_time: z.string().min(1, "Date and time are required"),
  description: z.string().optional(),
  venues: z.array(venueSchema).min(1, "At least one venue is required"),
});

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
    return { success: false, error: "Failed to fetch events" };
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
    return { success: false, error: "Failed to fetch event" };
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
      // Rollback: delete the event if venues creation fails
      await supabase.from("events").delete().eq("id", event.id);
      return { success: false, error: venuesError.message };
    }

    revalidatePath("/dashboard");
    return { success: true, data: { id: event.id } };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0]?.message || "Validation error" };
    }
    return { success: false, error: "Failed to create event" };
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
    return { success: false, error: "Failed to update event" };
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
    return { success: false, error: "Failed to delete event" };
  }
}
