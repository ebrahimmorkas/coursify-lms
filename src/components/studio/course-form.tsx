"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/input";
import { CATEGORIES, LEVEL_LABELS, LEVELS } from "@/lib/catalog";
import type { FormState } from "@/lib/validations/auth";

type CourseFormValues = {
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: string;
  priceCents: number;
};

export function CourseForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  defaultValues?: CourseFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  useEffect(() => {
    if (state?.success && state.message) toast.success(state.message);
  }, [state]);

  // After a failed submit, show what the user typed; otherwise the saved values.
  const value = (field: keyof CourseFormValues | "price") =>
    state?.fields?.[field] ??
    (field === "price"
      ? defaultValues
        ? (defaultValues.priceCents / 100).toFixed(2)
        : "0"
      : (defaultValues?.[field]?.toString() ?? ""));

  return (
    <form action={formAction} className="space-y-5" noValidate key={JSON.stringify(state?.fields)}>
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={value("title")} maxLength={120} />
        <FieldError messages={state?.errors?.title} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input id="subtitle" name="subtitle" defaultValue={value("subtitle")} maxLength={200} />
        <FieldError messages={state?.errors?.subtitle} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={6}
          defaultValue={value("description")}
        />
        <FieldError messages={state?.errors?.description} />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <Select id="category" name="category" defaultValue={value("category")}>
            <option value="" disabled>
              Select…
            </option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
          <FieldError messages={state?.errors?.category} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="level">Level</Label>
          <Select id="level" name="level" defaultValue={value("level") || "beginner"}>
            {LEVELS.map((level) => (
              <option key={level} value={level}>
                {LEVEL_LABELS[level]}
              </option>
            ))}
          </Select>
          <FieldError messages={state?.errors?.level} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="price">Price (USD)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={value("price")}
          />
          <p className="text-xs text-slate-500">Use 0 for a free course.</p>
          <FieldError messages={state?.errors?.price} />
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
