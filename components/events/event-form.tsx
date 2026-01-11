"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createEvent, updateEvent } from "@/app/dashboard/actions";
import { EventWithVenues } from "@/lib/types/database";
import { useState } from "react";

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

const venueSchema = z.object({
  name: z.string().min(1, "Venue name is required"),
  address: z.string().optional(),
});

const eventFormSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  sport_type: z.string().min(1, "Sport type is required"),
  date_time: z.string().min(1, "Date and time are required"),
  description: z.string().optional(),
  venues: z.array(venueSchema).min(1, "At least one venue is required"),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  event?: EventWithVenues;
  mode: "create" | "edit";
}

export function EventForm({ event, mode }: EventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: Partial<EventFormValues> = event
    ? {
        name: event.name,
        sport_type: event.sport_type,
        date_time: new Date(event.date_time).toISOString().slice(0, 16),
        description: event.description || "",
        venues: event.venues.map((v) => ({
          name: v.name,
          address: v.address || "",
        })),
      }
    : {
        name: "",
        sport_type: "",
        date_time: "",
        description: "",
        venues: [{ name: "", address: "" }],
      };

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "venues",
  });

  async function onSubmit(data: EventFormValues) {
    setIsSubmitting(true);

    const result =
      mode === "create"
        ? await createEvent(data)
        : await updateEvent({ ...data, id: event!.id });

    if (result.success) {
      toast.success(
        mode === "create"
          ? "Event created successfully"
          : "Event updated successfully"
      );
      router.push("/dashboard");
      router.refresh();
    } else {
      toast.error(result.error);
    }

    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>
              Enter the basic information about your event
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Summer Basketball Tournament"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sport_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sport Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a sport" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SPORT_TYPES.map((sport) => (
                        <SelectItem key={sport} value={sport}>
                          {sport}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date and Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us more about this event..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide additional details about the event
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Venues</CardTitle>
                <CardDescription>
                  Add one or more venues for this event
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", address: "" })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Venue
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id}>
                {index > 0 && <Separator className="my-6" />}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Venue {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <FormField
                    control={form.control}
                    name={`venues.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Venue Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Community Sports Center"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`venues.${index}.address`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 123 Main St, City, State"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
                ? "Create Event"
                : "Update Event"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
