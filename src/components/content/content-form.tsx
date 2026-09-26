"use client";

import { useActionState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadField } from "@/components/content/upload-field";
import type { SubmissionFormState } from "@/app/submissions/actions";
import { contentTypes, type ContentSlug, type FieldDef } from "@/lib/content/types";
import { useFocusFirstError } from "@/lib/use-focus-first-error";

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive md:text-sm dark:bg-input/30";

type Props = {
  slug: ContentSlug;
  action: (state: SubmissionFormState, formData: FormData) => Promise<SubmissionFormState>;
  initialValues?: Record<string, string>;
  expeditions: { id: string; name: string }[];
};

export function ContentForm({ slug, action, initialValues = {}, expeditions }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const type = contentTypes[slug];
  const values = state.values ?? initialValues;
  const errors = state.errors ?? {};
  const formRef = useFocusFirstError<HTMLFormElement>(state.errors);

  return (
    // key forces inputs to remount with the server-returned values after a
    // failed submission, since they’re uncontrolled.
    <form ref={formRef} key={JSON.stringify(values)} action={formAction} className="grid gap-6" noValidate>
      {state.formError && (
        <Alert variant="destructive">
          <AlertDescription>{state.formError}</AlertDescription>
        </Alert>
      )}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>Some fields need attention.</AlertDescription>
        </Alert>
      )}

      {type.fields.map((field) => (
        <FieldInput
          key={field.name}
          field={field}
          defaultValue={values[field.name] ?? ""}
          error={errors[field.name]}
          expeditions={expeditions}
        />
      ))}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" name="intent" value="submit" disabled={pending}>
          Submit for Review
        </Button>
        <Button type="submit" name="intent" value="draft" variant="outline" disabled={pending}>
          Save Draft
        </Button>
      </div>
    </form>
  );
}

function FieldInput({
  field,
  defaultValue,
  error,
  expeditions,
}: {
  field: FieldDef;
  defaultValue: string;
  error?: string;
  expeditions: { id: string; name: string }[];
}) {
  const id = `field-${field.name}`;
  const describedBy = [field.help && `${id}-help`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  const common = {
    id,
    name: field.name,
    defaultValue,
    "aria-invalid": !!error,
    "aria-describedby": describedBy,
    required: field.required,
  };

  let control;
  switch (field.kind) {
    case "textarea":
      control = <Textarea {...common} rows={6} placeholder={field.placeholder} />;
      break;
    case "select":
      control = (
        <select {...common} className={selectClass}>
          <option value="">Choose…</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
      break;
    case "expedition":
      control = (
        <select {...common} className={selectClass}>
          <option value="">None</option>
          {expeditions.map((expedition) => (
            <option key={expedition.id} value={expedition.id}>
              {expedition.name}
            </option>
          ))}
        </select>
      );
      break;
    case "date":
      control = <Input {...common} type="date" />;
      break;
    case "year":
      control = <Input {...common} type="number" inputMode="numeric" min={1900} />;
      break;
    case "url":
      if (field.upload) {
        control = <UploadField bucket={field.upload} inputProps={common} />;
        break;
      }
      control = <Input {...common} type="url" inputMode="url" placeholder={field.placeholder ?? "https://"} />;
      break;
    default:
      control = <Input {...common} type="text" placeholder={field.placeholder} />;
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>
        {field.label}
        {!field.required && <span className="font-normal text-muted-foreground">(optional)</span>}
      </Label>
      {control}
      {field.help && (
        <p id={`${id}-help`} className="text-sm text-muted-foreground">
          {field.help}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
