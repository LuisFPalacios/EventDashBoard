import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Fastbreak</h1>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Manage Sports Events
            <span className="block text-blue-600">Like a Pro</span>
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            The simplest way to create, organize, and track sports events. Built for coaches, organizers, and sports enthusiasts.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/auth/signup">
                Start Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-32 max-w-5xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border bg-white p-8 shadow-sm">
              <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">
                Event Management
              </h3>
              <p className="text-slate-600">
                Create and manage sports events with dates, times, and descriptions. Keep everything organized in one place.
              </p>
            </div>

            <div className="rounded-lg border bg-white p-8 shadow-sm">
              <div className="mb-4 inline-flex rounded-lg bg-green-100 p-3">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">
                Multi-Venue Support
              </h3>
              <p className="text-slate-600">
                Add multiple venues to each event. Perfect for tournaments and events with backup locations.
              </p>
            </div>

            <div className="rounded-lg border bg-white p-8 shadow-sm">
              <div className="mb-4 inline-flex rounded-lg bg-purple-100 p-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">
                Search & Filter
              </h3>
              <p className="text-slate-600">
                Quickly find events by name or sport type. Real-time search makes organizing effortless.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-32 max-w-3xl rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-12 text-center shadow-xl">
          <h3 className="text-3xl font-bold text-white">
            Ready to Get Started?
          </h3>
          <p className="mt-4 text-lg text-blue-100">
            Join sports organizers managing their events with Fastbreak.
          </p>
          <Button size="lg" variant="secondary" className="mt-8" asChild>
            <Link href="/auth/signup">Create Your Account</Link>
          </Button>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-12 mt-20 border-t">
        <div className="text-center text-sm text-slate-600">
          <p>&copy; 2026 Fastbreak Event Dashboard. Built with Next.js and Supabase.</p>
        </div>
      </footer>
    </div>
  );
}
