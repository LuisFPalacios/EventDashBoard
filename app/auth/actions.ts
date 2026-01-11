"use server";

import { createClient } from "@/lib/supabase/server";
import { z, ZodError } from "zod";
import { redirect } from "next/navigation";
import { ActionResult } from "@/lib/action-helper";

const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function signUp(
  input: unknown
): Promise<ActionResult<{ message: string }>> {
  try {
    const { email, password } = signUpSchema.parse(input);
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: { message: "Check your email to confirm your account" },
    };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        error: firstError?.message || "Validation error",
      };
    }

    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function signIn(
  input: unknown
): Promise<ActionResult<{ message: string }>> {
  try {
    const { email, password } = signInSchema.parse(input);
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { message: "Successfully signed in" } };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        error: firstError?.message || "Validation error",
      };
    }

    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

export async function signInWithGoogle(): Promise<
  ActionResult<{ url: string }>
> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { url: data.url } };
  } catch (error) {
    return { success: false, error: "Failed to initiate Google sign-in" };
  }
}
