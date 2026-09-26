import { Badge } from "@/components/ui/badge";
import type { ContentStatus } from "@/generated/prisma/enums";

const labels: Record<ContentStatus, string> = {
  DRAFT: "Draft",
  PENDING: "Pending review",
  PUBLISHED: "Published",
  REJECTED: "Rejected",
};

const variants = {
  DRAFT: "outline",
  PENDING: "secondary",
  PUBLISHED: "default",
  REJECTED: "destructive",
} as const satisfies Record<ContentStatus, string>;

export function StatusBadge({ status }: { status: ContentStatus }) {
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}
