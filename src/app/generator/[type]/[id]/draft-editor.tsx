"use client";

import { useActionState, useState } from "react";
import { CopyButton } from "@/components/archive/copy-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { EditState } from "@/app/generator/actions";

const savedMessages = {
  saved: "Changes saved.",
  published: "Published.",
  unpublished: "Moved back to draft.",
};

export function DraftEditor({
  id,
  heading,
  text,
  published,
  method,
  limit,
  action,
}: {
  id: string;
  heading: string;
  text: string;
  published: boolean;
  method: "RULE_BASED" | "AI_ASSISTED";
  limit?: number;
  action: (state: EditState, formData: FormData) => Promise<EditState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [value, setValue] = useState(text);
  // Regenerating replaces the text from the server; adopt it without
  // remounting (a remount would also drop the "Published." confirmation).
  const [serverText, setServerText] = useState(text);
  if (text !== serverText) {
    setServerText(text);
    setValue(text);
  }
  // Links count as 23 characters on X/Twitter, whatever their real length.
  const effectiveLength = value.replace(/https?:\/\/\S+/g, "x".repeat(23)).length;

  return (
    <form action={formAction} className="grid gap-3 rounded-lg border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold">{heading}</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{method === "RULE_BASED" ? "Rule-based" : "AI-assisted"}</Badge>
          {published ? (
            <Badge>Published</Badge>
          ) : (
            <Badge variant="secondary">Draft: review before publishing</Badge>
          )}
        </div>
      </div>

      <Label htmlFor={`text-${id}`} className="sr-only">
        {heading}
      </Label>
      <Textarea
        id={`text-${id}`}
        name="text"
        rows={limit ? 6 : 9}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      {limit && (
        <p className={effectiveLength > limit ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>
          {effectiveLength} / {limit} characters (links count as 23)
        </p>
      )}

      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {state.saved && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {savedMessages[state.saved]}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {published ? (
          <Button type="submit" name="intent" value="unpublish" variant="outline" size="sm" disabled={pending}>
            Move back to draft
          </Button>
        ) : (
          <Button type="submit" name="intent" value="publish" size="sm" disabled={pending}>
            Publish
          </Button>
        )}
        <Button type="submit" name="intent" value="save" variant="outline" size="sm" disabled={pending}>
          Save changes
        </Button>
        <CopyButton text={value} label="Copy text" />
      </div>
    </form>
  );
}
