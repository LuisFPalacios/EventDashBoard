import { getEvent } from "@/app/dashboard/actions";
import { EventsHeader } from "@/components/events/events-header";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, MapPin, Pencil } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

interface EventDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EventDetailsPage({
  params,
}: EventDetailsPageProps) {
  const { id } = await params;
  const result = await getEvent(id);

  if (!result.success) {
    if (result.error === "Not authenticated") {
      redirect("/auth/login");
    }
    notFound();
  }

  const event = result.data;

  return (
    <div className="min-h-screen bg-slate-50">
      <EventsHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{event.name}</h1>
              <Badge variant="secondary" className="text-base">
                {event.sport_type}
              </Badge>
            </div>
            <div className="mt-3 flex items-center text-muted-foreground">
              <Calendar className="mr-2 h-5 w-5" />
              {format(new Date(event.date_time), "PPPP 'at' p")}
            </div>
          </div>
          <Button asChild>
            <Link href={`/dashboard/events/${event.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Event
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            {event.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {event.description}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Venues</CardTitle>
                <CardDescription>
                  {event.venues.length}{" "}
                  {event.venues.length === 1 ? "venue" : "venues"} for this
                  event
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.venues.map((venue, index) => (
                  <div key={venue.id}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-1 h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-semibold">{venue.name}</h3>
                          {venue.address && (
                            <p className="text-sm text-muted-foreground">
                              {venue.address}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Sport Type
                  </p>
                  <p className="mt-1 font-medium">{event.sport_type}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Date & Time
                  </p>
                  <p className="mt-1 font-medium">
                    {format(new Date(event.date_time), "PPP")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.date_time), "p")}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Created
                  </p>
                  <p className="mt-1 text-sm">
                    {format(new Date(event.created_at), "PPP")}
                  </p>
                </div>
                {event.updated_at !== event.created_at && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Last Updated
                      </p>
                      <p className="mt-1 text-sm">
                        {format(new Date(event.updated_at), "PPP")}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8">
          <Button variant="outline" asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
