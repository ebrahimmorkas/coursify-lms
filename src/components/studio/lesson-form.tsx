"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/input";
import type { FormState } from "@/lib/validations/auth";

type LessonValues = {
  title: string;
  content: string;
  videoUrl: string | null;
  durationMinutes: number;
  isPreview: boolean;
};

export function LessonForm({
  action,
  defaultValues,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  defaultValues: LessonValues;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  useEffect(() => {
    if (state?.success && state.message) toast.success(state.message);
  }, [state]);

  const fields = state?.fields;

  return (
    <form action={formAction} className="space-y-5" noValidate key={JSON.stringify(fields)}>
      <div className="space-y-1.5">
        <Label htmlFor="title">Lesson title</Label>
        <Input id="title" name="title" defaultValue={fields?.title ?? defaultValues.title} />
        <FieldError messages={state?.errors?.title} />
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_160px]">
        <div className="space-y-1.5">
          <Label htmlFor="videoUrl">Video URL (optional)</Label>
          <Input
            id="videoUrl"
            name="videoUrl"
            placeholder="https://www.youtube.com/watch?v=…"
            defaultValue={fields?.videoUrl ?? defaultValues.videoUrl ?? ""}
          />
          <FieldError messages={state?.errors?.videoUrl} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="durationMinutes">Duration (min)</Label>
          <Input
            id="durationMinutes"
            name="durationMinutes"
            type="number"
            min={1}
            max={600}
            defaultValue={fields?.durationMinutes ?? defaultValues.durationMinutes}
          />
          <FieldError messages={state?.errors?.durationMinutes} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="content">Content (Markdown)</Label>
        <Textarea
          id="content"
          name="content"
          rows={16}
          className="font-mono text-[13px]"
          defaultValue={fields?.content ?? defaultValues.content}
        />
        <p className="text-xs text-slate-500">
          Supports headings, lists, links, tables and fenced code blocks.
        </p>
        <FieldError messages={state?.errors?.content} />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="isPreview"
          defaultChecked={fields ? fields.isPreview === "on" : defaultValues.isPreview}
          className="size-4 rounded border-slate-300 accent-brand-600"
        />
        Free preview — anyone can watch this lesson before enrolling
      </label>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save lesson"}
      </Button>
    </form>
  );
}
