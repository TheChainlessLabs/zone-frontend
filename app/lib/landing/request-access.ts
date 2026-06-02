import { z } from "zod";

export const requestAccessUseCases = [
  { value: "fund", label: "Fund or trading desk" },
  { value: "treasury", label: "Treasury" },
  { value: "payment-processor", label: "Payment processor" },
  { value: "currency-trader", label: "Currency trader" },
  { value: "other", label: "Other" },
] as const;

export const requestAccessSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80, "Keep name under 80 characters."),
  email: z.string().trim().email("Enter a valid work email.").max(120, "Keep email under 120 characters."),
  organization: z
    .string()
    .trim()
    .min(2, "Enter your organization.")
    .max(100, "Keep organization under 100 characters."),
  useCase: z.enum(
    requestAccessUseCases.map((item) => item.value) as [
      (typeof requestAccessUseCases)[number]["value"],
      ...Array<(typeof requestAccessUseCases)[number]["value"]>,
    ],
  ),
  message: z
    .string()
    .trim()
    .min(10, "Add a short note on the flow you want to move.")
    .max(500, "Keep the note under 500 characters."),
});

export type RequestAccessValues = z.infer<typeof requestAccessSchema>;
