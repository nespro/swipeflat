/**
 * Client-side listing filters — pure functions with no server dependencies.
 *
 * Moved from listing-cache.ts so filtering can run entirely in the browser
 * after the static listings.json is fetched.
 */

import type { Listing } from "../types";

/* ---------- Text normalization ---------- */

/**
 * Strip diacritics and lowercase for location matching.
 * "Zürich" → "zurich", "Genève" → "geneve"
 */
function normalizeSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/* ---------- Geo utilities ---------- */

const EARTH_RADIUS_KM = 6371;

/** Haversine distance between two lat/lng points in kilometers. */
function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Compute the centroid (average lat/lng) for a set of listings.
 * Only considers listings that have coordinates.
 */
function computeCentroid(
  listings: Listing[]
): { lat: number; lng: number } | null {
  const withCoords = listings.filter(
    (l) => l.latitude !== null && l.longitude !== null
  );
  if (withCoords.length === 0) return null;

  const lat =
    withCoords.reduce((s, l) => s + l.latitude!, 0) / withCoords.length;
  const lng =
    withCoords.reduce((s, l) => s + l.longitude!, 0) / withCoords.length;
  return { lat, lng };
}

/* ---------- Filter interface ---------- */

export interface FilterParams {
  location?: string;
  radiusKm?: number;
  maxRent?: number;
  minRooms?: number;
  excludeIds?: Set<string>;
}

/**
 * Filter listings by search parameters (client-side).
 *
 * Location + radius logic:
 *   radiusKm = 0 (or undefined): exact text match on city/address/zip
 *   radiusKm > 0: text-match to find anchor listings, compute centroid,
 *                  then include ALL listings within radiusKm of that centroid.
 *
 * Returns listings sorted by distance when radius is active.
 */
export function filterListings(
  listings: Listing[],
  params: FilterParams
): Listing[] {
  let result = listings;

  if (params.excludeIds && params.excludeIds.size > 0) {
    result = result.filter((l) => !params.excludeIds!.has(l.id));
  }

  if (params.location) {
    const radiusKm = params.radiusKm ?? 0;

    if (radiusKm > 0) {
      const q = normalizeSearch(params.location);
      const anchors = result.filter(
        (l) =>
          normalizeSearch(l.city).includes(q) ||
          normalizeSearch(l.address).includes(q) ||
          (l.zipCode !== null && l.zipCode.includes(q))
      );

      const centroid = computeCentroid(anchors);

      if (centroid) {
        result = result
          .map((l) => {
            const dist =
              l.latitude !== null && l.longitude !== null
                ? haversineKm(centroid.lat, centroid.lng, l.latitude, l.longitude)
                : Infinity;
            return { listing: l, distanceKm: dist };
          })
          .filter((item) => item.distanceKm <= radiusKm)
          .sort((a, b) => a.distanceKm - b.distanceKm)
          .map((item) => item.listing);
      } else {
        result = anchors;
      }
    } else {
      const q = normalizeSearch(params.location);
      result = result.filter(
        (l) =>
          normalizeSearch(l.city).includes(q) ||
          normalizeSearch(l.address).includes(q) ||
          (l.zipCode !== null && l.zipCode.includes(q))
      );
    }
  }

  if (params.maxRent) {
    result = result.filter((l) => l.rent <= params.maxRent!);
  }

  if (params.minRooms) {
    result = result.filter(
      (l) => l.rooms !== null && l.rooms >= params.minRooms!
    );
  }

  return result;
}

/** Get sorted unique city names from a listing array. */
export function getAvailableCities(listings: Listing[]): string[] {
  return [...new Set(listings.map((l) => l.city))].sort();
}
