"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  signupSchema,
  signupUseCases,
  type SignupFormValues,
} from "@/lib/landing/signup-form";

interface SignupModalProps {
  onClose: () => void;
}

const defaultValues: SignupFormValues = {
  contactType: "email",
  contact: "",
  useCase: "fund",
  message: "",
};

export function SignupModal({ onClose }: SignupModalProps) {
  const [status, setStatus] = React.useState<"idle" | "success" | "error">("idle");
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues,
  });

  async function onSubmit(values: SignupFormValues) {
    setStatus("idle");

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      form.reset(defaultValues);
      setStatus("success");
      setTimeout(() => {
        onClose();
        window.location.href = "/trade";
      }, 2000);
    } catch {
      setStatus("error");
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--card)] p-8 sm:p-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[clamp(24px,4vw,32px)] font-semibold leading-[1.1]">
            Get early access
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <Form {...form}>
          <form
            className="grid gap-5"
            noValidate
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="contactType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Contact type</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-[var(--foreground)] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        {...field}
                      >
                        <option value="email">Email</option>
                        <option value="telegram">Telegram</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>
                      {form.watch("contactType") === "email" ? "Email" : "Telegram handle"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          form.watch("contactType") === "email"
                            ? "you@company.com"
                            : "@yourusername"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      {signupUseCases.map((item) => (
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

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>What do you want to move privately?</FormLabel>
                  <FormControl>
                    <textarea
                      className="min-h-24 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm text-[var(--foreground)] shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="Pairs, rough monthly volume, and settlement needs."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Sending request" : "Request Access"}
            </Button>

            {status === "success" ? (
              <p role="status" className="text-sm font-medium text-[var(--foreground)]">
                Access request received. Welcome!
              </p>
            ) : null}
            {status === "error" ? (
              <p role="alert" className="text-sm font-medium text-[var(--destructive)]">
                Request did not send. Try again in a moment.
              </p>
            ) : null}
          </form>
        </Form>
      </div>
    </div>
  );
}
