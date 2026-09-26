"use client";

import { useActionState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFocusFirstError } from "@/lib/use-focus-first-error";
import { requestResearcherAccess, type RequestAccessState } from "./actions";

export function RequestAccessForm({ defaultName }: { defaultName: string }) {
  const [state, formAction, pending] = useActionState<RequestAccessState, FormData>(
    requestResearcherAccess,
    {}
  );
  const errors = state.errors ?? {};
  const formRef = useFocusFirstError<HTMLFormElement>(state.errors);

  return (
    <form ref={formRef} action={formAction} className="grid gap-5" noValidate>
      {errors.form && (
        <Alert variant="destructive">
          <AlertDescription>{errors.form}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          defaultValue={defaultName}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          required
        />
        {errors.name && (
          <p id="name-error" className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="affiliation">Institutional affiliation</Label>
        <Input
          id="affiliation"
          name="affiliation"
          autoComplete="organization"
          placeholder="e.g. NCPOR, Goa"
          aria-invalid={!!errors.affiliation}
          aria-describedby={errors.affiliation ? "affiliation-error" : undefined}
          required
        />
        {errors.affiliation && (
          <p id="affiliation-error" className="text-sm text-destructive">
            {errors.affiliation}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="reason">Why do you need researcher access?</Label>
        <Textarea
          id="reason"
          name="reason"
          rows={4}
          placeholder="Your role, the expedition or project you’ll be submitting material for."
          aria-invalid={!!errors.reason}
          aria-describedby={errors.reason ? "reason-error" : undefined}
          required
        />
        {errors.reason && (
          <p id="reason-error" className="text-sm text-destructive">{errors.reason}</p>
        )}
      </div>

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Submitting…" : "Submit Request"}
      </Button>
    </form>
  );
}
