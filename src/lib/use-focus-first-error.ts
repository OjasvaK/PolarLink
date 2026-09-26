"use client";

import { useEffect, useRef } from "react";

// After a failed submit, move focus to the first invalid field (spec
// section 9, forms), so keyboard and screen-reader users land on the error.
export function useFocusFirstError<T extends HTMLElement>(errors: unknown) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    if (!errors || (typeof errors === "object" && Object.keys(errors).length === 0)) return;
    const invalid = ref.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    invalid?.focus();
  }, [errors]);
  return ref;
}
