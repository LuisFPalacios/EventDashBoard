import { z, ZodSchema, ZodError } from "zod";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Generic action wrapper that provides:
 * - Type-safe input validation with Zod
 * - Consistent error handling
 * - Standardized return format
 */
export async function createAction<TInput, TOutput>(
  schema: ZodSchema<TInput>,
  handler: (validatedInput: TInput) => Promise<TOutput>
): Promise<(input: unknown) => Promise<ActionResult<TOutput>>> {
  return async (input: unknown): Promise<ActionResult<TOutput>> => {
    try {
      // Validate input
      const validatedInput = schema.parse(input);

      // Execute handler
      const result = await handler(validatedInput);

      return { success: true, data: result };
    } catch (error: unknown) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const firstError = error.issues[0];
        return {
          success: false,
          error: `${firstError?.path.join(".") || "validation"}: ${firstError?.message || "error"}`,
        };
      }

      // Handle other errors
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }

      return { success: false, error: "An unexpected error occurred" };
    }
  };
}

/**
 * Simplified action creator for actions without input validation
 */
export async function createSimpleAction<TOutput>(
  handler: () => Promise<TOutput>
): Promise<() => Promise<ActionResult<TOutput>>> {
  return async (): Promise<ActionResult<TOutput>> => {
    try {
      const result = await handler();
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: "An unexpected error occurred" };
    }
  };
}
