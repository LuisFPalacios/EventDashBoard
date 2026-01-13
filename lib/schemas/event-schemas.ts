import { z } from "zod";

export const venueSchema = z.object({
  name: z.string().min(1, "Venue name is required"),
  address: z.string().optional(),
});

export const createEventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  sport_type: z.string().min(1, "Sport type is required"),
  date_time: z.string().min(1, "Date and time are required"),
  description: z.string().optional(),
  venues: z.array(venueSchema).min(1, "At least one venue is required"),
});

export const updateEventSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Event name is required"),
  sport_type: z.string().min(1, "Sport type is required"),
  date_time: z.string().min(1, "Date and time are required"),
  description: z.string().optional(),
  venues: z.array(venueSchema).min(1, "At least one venue is required"),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type VenueInput = z.infer<typeof venueSchema>;
