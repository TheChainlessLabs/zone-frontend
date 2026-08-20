import { z } from "zod";

export const signupUseCases = [
  { value: "fund", label: "Fund or trading desk" },
  { value: "treasury", label: "Treasury" },
  { value: "payment-processor", label: "Payment processor" },
  { value: "currency-trader", label: "Currency trader" },
  { value: "other", label: "Other" },
] as const;

export const signupSchema = z.object({
  contactType: z.enum(["email", "telegram"]),
  contact: z
    .string()
    .trim()
    .min(1, "Enter your email or Telegram handle.")
    .max(120, "Keep contact under 120 characters."),
  useCase: z.enum(
    signupUseCases.map((item) => item.value) as [
      (typeof signupUseCases)[number]["value"],
      ...Array<(typeof signupUseCases)[number]["value"]>,
    ],
  ),
  message: z
    .string()
    .trim()
    .min(10, "Add a short note on the flow you want to move.")
    .max(500, "Keep the note under 500 characters."),
});

export type SignupFormValues = z.infer<typeof signupSchema>;
