"use client";

import { useActionState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ReviewFormState } from "@/app/review/actions";

export function ReviewForm({
  action,
}: {
  action: (state: ReviewFormState, formData: FormData) => Promise<ReviewFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="grid gap-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-2">
        <Label htmlFor="comment">
          Comment <span className="font-normal text-muted-foreground">(required unless approving)</span>
        </Label>
        <Textarea id="comment" name="comment" rows={4} placeholder="Shown to the submitter." />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" name="decision" value="APPROVED" disabled={pending}>
          Approve and publish
        </Button>
        <Button type="submit" name="decision" value="CHANGES_REQUESTED" variant="outline" disabled={pending}>
          Request changes
        </Button>
        <Button type="submit" name="decision" value="REJECTED" variant="destructive" disabled={pending}>
          Reject
        </Button>
      </div>
    </form>
  );
}
