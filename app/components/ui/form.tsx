"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { Animate } from "@/components/ui/animate";
import { Label } from "@/components/ui/label";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";

/**
 * Form — composed wrapper around react-hook-form's `FormProvider`, plus the
 * standard shadcn field/item/control/description/message primitives wired to
 * Omega tokens and brand microcopy patterns.
 *
 * Brand microcopy patterns (from `omega-docs/03-brand/messaging.md`):
 *   - Errors follow `[What happened.] [What to do next.]` — the rendering
 *     here ships the Icon.Failed indicator + destructive token; the actual
 *     copy is the consumer's job (typically via the zod schema).
 *   - Description text is muted, caption-sized, terse — no marketing voice.
 *     Voice rule is the consumer's; the chrome is the primitive's.
 *   - `FormLabel` supports a `required` prop that surfaces a small accent
 *     dot (Linear pattern) instead of an asterisk.
 *
 * Validation timing:
 *   - Default react-hook-form behaviour is `mode: "onSubmit"` +
 *     `reValidateMode: "onBlur"`, which matches Linear / Vercel forms:
 *     don't yell on first focus; once they've tried to submit, validate on
 *     blur per field. We rely on RHF defaults — consumers can override.
 *
 * Usage:
 *
 *   const form = useForm<Schema>({ resolver: zodResolver(schema) });
 *   <Form {...form}>
 *     <form onSubmit={form.handleSubmit(onSubmit)}>
 *       <FormField
 *         control={form.control}
 *         name="amount"
 *         render={({ field }) => (
 *           <FormItem>
 *             <FormLabel required>Amount</FormLabel>
 *             <FormControl>
 *               <Input {...field} />
 *             </FormControl>
 *             <FormDescription>Settled in the next batch.</FormDescription>
 *             <FormMessage />
 *           </FormItem>
 *         )}
 *       />
 *     </form>
 *   </Form>
 */
const Form = FormProvider;

// --- FormField -------------------------------------------------------------

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(
  null
);

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

// --- useFormField ----------------------------------------------------------

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext) {
    throw new Error("useFormField must be used within <FormField>");
  }

  const fieldState = getFieldState(fieldContext.name, formState);

  const { id } = itemContext ?? { id: "" };

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

// --- FormItem --------------------------------------------------------------

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue | null>(null);

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("flex flex-col gap-2.5", className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

// --- FormLabel -------------------------------------------------------------

interface FormLabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  /**
   * Surface a small accent dot after the label text to signal a required
   * field. Linear pattern — no asterisk, no shouted "(required)".
   */
  required?: boolean;
}

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  FormLabelProps
>(({ className, children, required = false, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium leading-none text-foreground",
        error && "text-[var(--destructive)]",
        className
      )}
      htmlFor={formItemId}
      {...props}
    >
      <span>{children}</span>
      {required ? (
        <span
          aria-hidden
          // Accent dot — Linear-style required indicator. Inherits
          // `text-destructive` when the field is in error so it visually
          // ties to the error state.
          className={cn(
            "inline-block h-1 w-1 shrink-0 rounded-full bg-[var(--muted-foreground)]",
            error && "bg-[var(--destructive)]"
          )}
        />
      ) : null}
    </Label>
  );
});
FormLabel.displayName = "FormLabel";

// --- FormControl -----------------------------------------------------------

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

// --- FormDescription -------------------------------------------------------

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn(
        // Caption-size, muted. Voice rule (terse, no marketing) is the
        // consumer's job — see omega-docs/03-brand/messaging.md.
        "text-xs leading-relaxed text-[var(--muted-foreground)]",
        className
      )}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

// --- FormMessage -----------------------------------------------------------

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message ?? "") : children;

  if (!body) {
    return null;
  }

  // Animate `enter` on first render keeps the error appearance from feeling
  // jarring without a heavy motion treatment. Reduced-motion path drops the
  // translation per the brand motion ladder.
  return (
    <Animate
      key={String(body)}
      variant="enter"
      // The ref + id + role land on the underlying motion.div; a11y-wise
      // the field's aria-describedby points here when there's an error.
      {...({ id: formMessageId, role: "alert" } as Record<string, unknown>)}
      ref={ref as unknown as React.Ref<HTMLDivElement>}
      className={cn(
        "inline-flex items-start gap-1.5 rounded-[var(--radius-sm)] bg-[color-mix(in_oklab,var(--destructive)_10%,transparent)] px-2 py-1.5 text-xs leading-relaxed text-[var(--destructive)]",
        className
      )}
      {...(props as Record<string, unknown>)}
    >
      <Icon.Failed
        size={12}
        aria-hidden
        className="mt-0.5 shrink-0"
      />
      <span>{body}</span>
    </Animate>
  );
});
FormMessage.displayName = "FormMessage";

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
};
