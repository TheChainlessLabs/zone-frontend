"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
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
import {
  requestAccessSchema,
  requestAccessUseCases,
  type RequestAccessValues,
} from "@/lib/landing/request-access";

const defaultValues: RequestAccessValues = {
  name: "",
  email: "",
  organization: "",
  useCase: "fund",
  message: "",
};

type FormStatus = "idle" | "success" | "error";

export function RequestAccessForm() {
  const [status, setStatus] = React.useState<FormStatus>("idle");
  const form = useForm<RequestAccessValues>({
    resolver: zodResolver(requestAccessSchema),
    defaultValues,
  });

  async function onSubmit(values: RequestAccessValues) {
    setStatus("idle");

    try {
      const response = await fetch("/api/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      form.reset(defaultValues);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form
        className="grid gap-5"
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Name</FormLabel>
                <FormControl>
                  <Input autoComplete="name" placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Work email</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="email"
                    inputMode="email"
                    placeholder="Your contact"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="organization"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Organization</FormLabel>
                <FormControl>
                  <Input autoComplete="organization" placeholder="Treasury, trade desk, PSP" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="useCase"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Primary use case</FormLabel>
                <FormControl>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-[var(--foreground)] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    {...field}
                  >
                    {requestAccessUseCases.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>What do you want to move privately?</FormLabel>
              <FormControl>
                <textarea
                  className="min-h-28 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm text-[var(--foreground)] shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Pairs, rough monthly volume, and settlement needs."
                  {...field}
                />
              </FormControl>
              <FormDescription>Do not include private keys, wallet secrets, or trade instructions.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-3 md:grid-cols-[auto_1fr] md:items-center">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Sending request" : "Request Access"}
          </Button>
          <p className="text-xs leading-5 text-[var(--muted-foreground)]">
            All addresses and counterparties remain subject to screening.
          </p>
        </div>

        {status === "success" ? (
          <p role="status" className="text-sm font-medium text-[var(--foreground)]">
            Access request received.
          </p>
        ) : null}
        {status === "error" ? (
          <p role="alert" className="text-sm font-medium text-[var(--destructive)]">
            Request did not send. Try again in a moment.
          </p>
        ) : null}
      </form>
    </Form>
  );
}
