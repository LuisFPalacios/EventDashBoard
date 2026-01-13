import { z } from "zod";

export const SPORT_TYPES = [
  "Soccer",
  "Basketball",
  "Tennis",
  "Baseball",
  "Football",
  "Volleyball",
  "Hockey",
  "Swimming",
  "Other",
] as const;

export const venueSchema = z.object({
  name: z.string().min(1, "Venue name is required").max(200),
  address: z.string().max(500).optional(),
});

export const createEventSchema = z.object({
  name: z.string().min(1, "Event name is required").max(200),
  sport_type: z.enum(SPORT_TYPES),
  date_time: z.string().min(1, "Date and time are required"),
  description: z.string().max(2000).optional(),
  venues: z.array(venueSchema).min(1, "At least one venue is required").max(10),
});

export const updateEventSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Event name is required").max(200),
  sport_type: z.enum(SPORT_TYPES),
  date_time: z.string().min(1, "Date and time are required"),
  description: z.string().max(2000).optional(),
  venues: z.array(venueSchema).min(1, "At least one venue is required").max(10),
});

export const getEventsQuerySchema = z.object({
  searchQuery: z.string().max(100).optional(),
  sportFilter: z.enum([...SPORT_TYPES, "all"] as const).optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type VenueInput = z.infer<typeof venueSchema>;
export type GetEventsQuery = z.infer<typeof getEventsQuerySchema>;
