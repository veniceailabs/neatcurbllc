import { NextResponse } from "next/server";
import { fail, ok, safeRequestId } from "@/lib/api";
import { simpleRateLimit } from "@/lib/rateLimit";

type NominatimAddress = {
  house_number?: string;
  road?: string;
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
  county?: string;
  state?: string;
  state_district?: string;
  postcode?: string;
};

type NominatimResult = {
  display_name?: string;
  lat?: string;
  lon?: string;
  address?: NominatimAddress;
};

type AddressSuggestion = {
  label: string;
  zip: string | null;
  city: string | null;
  state: string | null;
  lat: number | null;
  lon: number | null;
};

const getClientIp = (request: Request) => {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
};

const buildLabel = (result: NominatimResult) => {
  const house = result.address?.house_number?.trim();
  const road = result.address?.road?.trim();
  const city =
    result.address?.city?.trim() ||
    result.address?.town?.trim() ||
    result.address?.village?.trim() ||
    result.address?.hamlet?.trim() ||
    result.address?.county?.trim() ||
    "";
  const state = result.address?.state?.trim() || result.address?.state_district?.trim() || "";
  const zip = result.address?.postcode?.trim() || "";

  const lineOne = [house, road].filter(Boolean).join(" ").trim();
  const fallback = String(result.display_name || "").split(",")[0]?.trim() || "";
  return [lineOne || fallback, city, state, zip].filter(Boolean).join(", ").trim();
};

const toSuggestion = (result: NominatimResult): AddressSuggestion | null => {
  const label = buildLabel(result);
  if (!label) return null;

  const city =
    result.address?.city ||
    result.address?.town ||
    result.address?.village ||
    result.address?.hamlet ||
    result.address?.county ||
    null;
  const state = result.address?.state || result.address?.state_district || null;
  const zip = result.address?.postcode || null;

  const parsedLat = result.lat ? Number.parseFloat(result.lat) : Number.NaN;
  const parsedLon = result.lon ? Number.parseFloat(result.lon) : Number.NaN;

  return {
    label,
    zip,
    city,
    state,
    lat: Number.isFinite(parsedLat) ? parsedLat : null,
    lon: Number.isFinite(parsedLon) ? parsedLon : null
  };
};

export async function GET(request: Request) {
  const requestId = safeRequestId();
  const query = new URL(request.url).searchParams.get("q")?.trim() || "";

  if (query.length < 3) {
    return NextResponse.json(
      fail("QUERY_TOO_SHORT", "Type at least 3 characters.", { requestId }),
      { status: 400 }
    );
  }

  const ip = getClientIp(request);
  const limited = simpleRateLimit(`addr:${ip}`, 40, 60_000);
  if (!limited.allowed) {
    return NextResponse.json(
      fail("RATE_LIMITED", "Too many lookups. Please retry shortly.", {
        requestId,
        retryAfterSec: limited.retryAfterSec
      }),
      { status: 429 }
    );
  }

  const queryWithState =
    /\bnew\s+york\b/i.test(query) || /\bny\b/i.test(query)
      ? query
      : `${query}, New York`;

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "6");
  url.searchParams.set("countrycodes", "us");
  url.searchParams.set("q", queryWithState);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "NeatCurbLLC/1.0 (neatcurb@gmail.com)"
    },
    next: { revalidate: 60 }
  }).catch(() => null);

  if (!response?.ok) {
    return NextResponse.json(
      fail("LOOKUP_FAILED", "Address lookup is unavailable right now.", { requestId }),
      { status: 502 }
    );
  }

  const raw = (await response.json().catch(() => [])) as NominatimResult[];
  const suggestions = Array.isArray(raw)
    ? raw
        .map(toSuggestion)
        .filter((entry): entry is AddressSuggestion => Boolean(entry))
        .reduce<AddressSuggestion[]>((acc, entry) => {
          if (!acc.some((existing) => existing.label === entry.label)) {
            acc.push(entry);
          }
          return acc;
        }, [])
    : [];

  return NextResponse.json(ok({ requestId, suggestions }));
}
