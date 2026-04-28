import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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

afterEach(cleanup);

const schema = z.object({
  name: z
    .string()
    .min(2, "Too short. Use at least 2 characters."),
});

type FormSchema = z.infer<typeof schema>;

function Harness({ onValid }: { onValid?: (v: FormSchema) => void }) {
  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => onValid?.(v))}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your handle" {...field} />
              </FormControl>
              <FormDescription>Visible to counterparties on settlement.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
}

it("Form wires label, description and control via aria attributes", () => {
  render(<Harness />);
  const input = screen.getByPlaceholderText("Your handle");
  // Label maps to control via htmlFor/id
  const label = screen.getByText("Name");
  expect(label.closest("label")?.getAttribute("for")).toBe(input.id);
  // Description is referenced via aria-describedby in the absence of an error
  const described = input.getAttribute("aria-describedby") ?? "";
  expect(described).toContain("description");
  expect(input.getAttribute("aria-invalid")).toBe("false");
});

it("FormMessage renders the zod error after a failed submit", async () => {
  render(<Harness />);
  fireEvent.click(screen.getByText("Submit"));
  await waitFor(() => {
    expect(screen.getByRole("alert").textContent ?? "").toContain(
      "Too short. Use at least 2 characters."
    );
  });
  const input = screen.getByPlaceholderText("Your handle");
  expect(input.getAttribute("aria-invalid")).toBe("true");
});

it("FormLabel required renders the accent dot", () => {
  render(<Harness />);
  const label = screen.getByText("Name").closest("label");
  // The accent dot is the `aria-hidden` span sibling of the label text.
  const dot = label?.querySelector("span[aria-hidden]");
  expect(dot).toBeTruthy();
});
