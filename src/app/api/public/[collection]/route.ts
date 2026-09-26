import type { NextRequest } from "next/server";
import {
  isPublicCollection,
  listCollection,
  publicCollections,
  publicHeaders,
  rateLimit,
  tooManyRequests,
} from "@/lib/public-api";

// GET /api/public/{expeditions|datasets|publications|media|activities}
//   ?page=1&pageSize=20 (pageSize 1-100)
// Read-only, unauthenticated, published content only (spec section 8.8).

export async function GET(request: NextRequest, ctx: RouteContext<"/api/public/[collection]">) {
  const limit = rateLimit(request);
  if (!limit.ok) return tooManyRequests(limit.resetAt);

  const { collection } = await ctx.params;
  if (!isPublicCollection(collection)) {
    return Response.json(
      { error: `Unknown collection. Use one of: ${publicCollections.join(", ")}.` },
      { status: 404, headers: publicHeaders }
    );
  }

  const params = request.nextUrl.searchParams;
  const page = Number(params.get("page") ?? 1);
  const pageSize = Number(params.get("pageSize") ?? 20);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    return Response.json(
      { error: "page must be a positive integer and pageSize an integer from 1 to 100." },
      { status: 400, headers: publicHeaders }
    );
  }

  const { total, items } = await listCollection(collection, { page, pageSize });
  return Response.json(
    {
      collection,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      items,
    },
    { headers: { ...publicHeaders, "X-RateLimit-Remaining": String(limit.remaining) } }
  );
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: publicHeaders });
}
