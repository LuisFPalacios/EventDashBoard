"use client";

import { EventWithVenues } from "@/lib/types/database";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, MapPin, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { deleteEvent } from "@/app/dashboard/actions";
import { toast } from "sonner";

interface EventCardProps {
  event: EventWithVenues;
  onDelete?: () => void;
}

export function EventCard({ event, onDelete }: EventCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteEvent(event.id);

    if (result.success) {
      toast.success("Event deleted successfully");
      setShowDeleteDialog(false);
      onDelete?.();
    } else {
      toast.error(result.error);
    }
    setIsDeleting(false);
  };

  return (
    <>
      <Card className="flex flex-col transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="line-clamp-1">{event.name}</CardTitle>
              <CardDescription className="mt-1">
                <Badge variant="secondary" className="font-medium">
                  {event.sport_type}
                </Badge>
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/events/${event.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            {format(new Date(event.date_time), "PPP 'at' p")}
          </div>
          {event.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {event.description}
            </p>
          )}
          <div className="space-y-1">
            <div className="flex items-center text-sm font-medium">
              <MapPin className="mr-2 h-4 w-4" />
              Venues ({event.venues.length})
            </div>
            <div className="ml-6 space-y-1">
              {event.venues.slice(0, 2).map((venue) => (
                <p key={venue.id} className="line-clamp-1 text-sm text-muted-foreground">
                  {venue.name}
                  {venue.address && ` - ${venue.address}`}
                </p>
              ))}
              {event.venues.length > 2 && (
                <p className="text-sm text-muted-foreground">
                  +{event.venues.length - 2} more
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href={`/dashboard/events/${event.id}`}>View Details</Link>
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the event
              &quot;{event.name}&quot; and all associated venues.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
