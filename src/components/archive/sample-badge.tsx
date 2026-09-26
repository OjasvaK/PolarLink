import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Marks illustrative seed records (isSample) so they’re never mistaken for
// official NCPOR material (spec section 3, SEED_DATA_NOTE.md).
export function SampleBadge({ className }: { className?: string }) {
  return (
    <Badge variant="secondary" className={cn("border-dashed", className)} title="Illustrative record, not an official NCPOR record">
      Sample data
    </Badge>
  );
}
