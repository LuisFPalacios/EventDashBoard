# Fastbreak Event Dashboard

A full-stack Sports Event Management application built with Next.js 15, TypeScript, Supabase, and Shadcn UI.

## Features

- **Authentication**: Email/password and Google OAuth sign-in via Supabase Auth
- **Event Management**: Create, read, update, and delete sports events
- **Multi-Venue Support**: Add multiple venues to each event
- **Search & Filter**: Real-time search by event name and filter by sport type
- **Responsive Design**: Mobile-first UI with Tailwind CSS
- **Type-Safe Actions**: Server actions with Zod validation and consistent error handling
- **Toast Notifications**: User feedback for all CRUD operations
- **Protected Routes**: Middleware-based authentication

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Form Handling**: React Hook Form + Zod
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account ([sign up here](https://supabase.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd fastbreak-event-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**

   Follow the detailed instructions in [SETUP.md](./SETUP.md) to:
   - Create a Supabase project
   - Set up the database schema
   - Configure authentication providers
   - Get your environment variables

4. **Configure environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
fastbreak-event-dashboard/
├── app/
│   ├── auth/
│   │   ├── actions.ts              # Authentication server actions
│   │   ├── login/page.tsx          # Login page
│   │   ├── signup/page.tsx         # Sign up page
│   │   └── callback/route.ts       # OAuth callback handler
│   ├── dashboard/
│   │   ├── actions.ts              # Event CRUD server actions
│   │   ├── page.tsx                # Dashboard home page
│   │   └── events/
│   │       ├── create/page.tsx     # Create event page
│   │       └── [id]/
│   │           ├── page.tsx        # Event details page
│   │           └── edit/page.tsx   # Edit event page
│   ├── layout.tsx                  # Root layout with Toaster
│   └── globals.css                 # Global styles
├── components/
│   ├── events/
│   │   ├── events-header.tsx       # Header with navigation
│   │   ├── events-list.tsx         # Event list with search/filter
│   │   ├── event-card.tsx          # Individual event card
│   │   └── event-form.tsx          # Reusable event form
│   └── ui/                         # Shadcn UI components
├── lib/
│   ├── supabase/
│   │   ├── server.ts               # Server-side Supabase client
│   │   └── client.ts               # Client-side Supabase client
│   ├── types/
│   │   └── database.ts             # TypeScript database types
│   ├── action-helper.ts            # Generic action wrapper utility
│   └── utils.ts                    # Utility functions
├── middleware.ts                   # Auth middleware
├── SETUP.md                        # Detailed setup instructions
└── README.md                       # This file
```

## Architecture Decisions

### Server-Side First Approach

All database interactions happen server-side using:
- **Server Actions**: Primary method for data mutations (aligned with Fastbreak's preference)
- **Server Components**: For data fetching on page load
- **No direct client-side Supabase calls**: Ensures security and proper authentication

### Type Safety

- **Generic Action Helper**: Wraps all server actions with:
  - Zod schema validation
  - Consistent error handling
  - Type-safe input/output

  Example usage:
  ```typescript
  const result = await createEvent(data);
  if (result.success) {
    // result.data is typed
  } else {
    // result.error is a string
  }
  ```

### Form Handling

- **Shadcn Form Component**: Built on react-hook-form
- **Zod Validation**: Client-side and server-side validation
- **Dynamic Fields**: Use `useFieldArray` for multiple venues

### Authentication Flow

1. User signs up/logs in (email or Google OAuth)
2. Supabase creates session cookies
3. Middleware checks authentication on every request
4. Protected routes redirect to login if unauthenticated
5. User ID automatically associated with events (Row Level Security)

## Database Schema

### Events Table
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to auth.users)
- `name` (text)
- `sport_type` (text)
- `date_time` (timestamptz)
- `description` (text, nullable)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### Venues Table
- `id` (UUID, primary key)
- `event_id` (UUID, foreign key to events)
- `name` (text)
- `address` (text, nullable)
- `created_at` (timestamptz)

**Row Level Security (RLS)**: Enabled on both tables to ensure users can only access their own data.

## Deployment

### Deploy to Vercel

1. **Push your code to GitHub**

2. **Import project to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure environment variables**
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Deploy**
   - Vercel will automatically build and deploy
   - Your app will be live at `your-project.vercel.app`

5. **Update Supabase Auth URLs**
   - In Supabase Dashboard > Authentication > URL Configuration
   - Add your Vercel URL to "Site URL" and "Redirect URLs"

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Features Implemented

- ✅ Email and Google OAuth authentication
- ✅ Protected routes with middleware
- ✅ Create events with multiple venues
- ✅ Edit existing events
- ✅ Delete events with confirmation
- ✅ View event details
- ✅ Search events by name
- ✅ Filter events by sport type
- ✅ Real-time search with database refetch
- ✅ Responsive design
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error handling
- ✅ Type-safe server actions
- ✅ Form validation (client and server)

## Contributing

This project was built as a coding challenge. Feel free to fork and extend it!

## License

MIT
