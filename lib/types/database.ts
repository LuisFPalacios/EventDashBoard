export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          sport_type: string;
          date_time: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          sport_type: string;
          date_time: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          sport_type?: string;
          date_time?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      venues: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          address?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

export type Event = Database["public"]["Tables"]["events"]["Row"];
export type Venue = Database["public"]["Tables"]["venues"]["Row"];

export interface EventWithVenues extends Event {
  venues: Venue[];
}
