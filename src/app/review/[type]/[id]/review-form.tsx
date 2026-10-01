"use client";

import { useActionState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ReviewFormState } from "@/app/review/actions";
import { useFocusFirstError } from "@/lib/use-focus-first-error";

export function ReviewForm({
  action,
}: {
  action: (state: ReviewFormState, formData: FormData) => Promise<ReviewFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const formRef = useFocusFirstError<HTMLFormElement>(state.error);

  return (
    <form ref={formRef} id="review-form" action={formAction} className="grid gap-4">
      {state.error && (
        <Alert variant="destructive" id="review-error">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-2">
        <Label htmlFor="comment">
          Comment <span className="font-normal text-muted-foreground">(required unless approving)</span>
        </Label>
        <Textarea
          id="comment"
          name="comment"
          rows={4}
          placeholder="Shown to the submitter."
          aria-invalid={!!state.error}
          aria-describedby={state.error ? "review-error" : undefined}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" name="decision" value="APPROVED" disabled={pending}>
          Approve and Publish
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="outline" disabled={pending}>
              Request Changes
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Request changes?</AlertDialogTitle>
              <AlertDialogDescription>
                This sends the submission back to the author as a draft, with your comment attached. They
                can resubmit once it&rsquo;s updated.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction type="submit" form="review-form" name="decision" value="CHANGES_REQUESTED">
                Request Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive" disabled={pending}>
              Reject
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject this submission?</AlertDialogTitle>
              <AlertDialogDescription>
                The author will see this as rejected, along with your comment. They can still edit and
                resubmit it later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                form="review-form"
                name="decision"
                value="REJECTED"
                variant="destructive"
              >
                Reject Submission
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </form>
  );
}
