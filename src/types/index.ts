/**
 * Core application types for SwipeFlat.
 * These mirror the Prisma schema but are used on the client side
 * without requiring Prisma imports.
 */

export type SwipeDirection = "LIKE" | "DISLIKE" | "SUPERLIKE";

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Portal {
  id: string;
  name: string;
  baseUrl: string;
  isActive: boolean;
}

export interface ListingFeatures {
  balcony?: boolean;
  parking?: boolean;
  elevator?: boolean;
  petsAllowed?: boolean;
  dishwasher?: boolean;
  washingMachine?: boolean;
  furnished?: boolean;
  garden?: boolean;
  [key: string]: boolean | undefined;
}

export interface Listing {
  id: string;
  portalId: string;
  externalId: string;
  portalUrl: string;
  title: string;
  description: string | null;
  address: string;
  city: string;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
  rent: number;
  additionalCosts: number | null;
  deposit: number | null;
  rooms: number | null;
  sizeSqm: number | null;
  floor: number | null;
  availableFrom: string | null;
  availableUntil: string | null;
  features: ListingFeatures | null;
  images: string[];
  floorplanUrl: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  isActive: boolean;
  portal?: Portal;
}

export interface Swipe {
  id: string;
  userId: string;
  listingId: string;
  direction: SwipeDirection;
  swipedAt: string;
  notes: string | null;
  listing?: Listing;
}

export interface SearchFilters {
  location: string;
  radiusKm: number;
  maxRent: number | null;
  minRooms: number | null;
  maxRooms: number | null;
  minSize: number | null;
  availableFrom: string | null;
  availableUntil: string | null;
  propertyTypes: string[];
  portals: string[];
  features: ListingFeatures | null;
  onlyNew: boolean;
}

export interface SearchConfig {
  id: string;
  userId: string;
  name: string | null;
  location: string;
  radiusKm: number;
  maxRent: number | null;
  minRooms: number | null;
  maxRooms: number | null;
  minSize: number | null;
  availableFrom: string | null;
  availableUntil: string | null;
  propertyTypes: string[];
  portals: string[];
  features: ListingFeatures | null;
  isDefault: boolean;
  createdAt: string;
}

export interface SavedFilter {
  id: string;
  userId: string;
  name: string;
  config: SearchFilters;
  createdAt: string;
}

/** API response types */

export interface ListingsResponse {
  listings: Listing[];
  total: number;
  hasMore: boolean;
}

export interface SwipeHistoryResponse {
  swipes: Swipe[];
  total: number;
  stats: {
    totalLiked: number;
    totalDisliked: number;
    totalSuperliked: number;
    byPortal: Record<string, number>;
  };
}

/** Utility types */

export type PropertyType = "apartment" | "house" | "room" | "studio" | "loft";

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "room", label: "Room" },
  { value: "studio", label: "Studio" },
  { value: "loft", label: "Loft" },
];

export const RADIUS_OPTIONS = [
  { value: 0, label: "Exact" },
  { value: 2, label: "2 km" },
  { value: 5, label: "5 km" },
  { value: 10, label: "10 km" },
  { value: 20, label: "20 km" },
  { value: 50, label: "50 km" },
];

export const PRICE_OPTIONS = [
  { value: null, label: "Any price" },
  { value: 500, label: "500 CHF" },
  { value: 1000, label: "1'000 CHF" },
  { value: 1500, label: "1'500 CHF" },
  { value: 2000, label: "2'000 CHF" },
  { value: 2500, label: "2'500 CHF" },
  { value: 3000, label: "3'000 CHF" },
  { value: 3500, label: "3'500+" },
];

export const ROOM_OPTIONS = [
  { value: null, label: "Any" },
  { value: 1, label: "1" },
  { value: 1.5, label: "1.5" },
  { value: 2, label: "2" },
  { value: 2.5, label: "2.5" },
  { value: 3, label: "3" },
  { value: 3.5, label: "3.5" },
  { value: 4, label: "4+" },
];

export const PORTAL_OPTIONS = [
  { value: "platform-a", label: "Platform A" },
  { value: "platform-b", label: "Platform B" },
  { value: "platform-c", label: "Platform C" },
];

export const DEFAULT_FILTERS: SearchFilters = {
  location: "Zürich",
  radiusKm: 5,
  maxRent: null,
  minRooms: null,
  maxRooms: null,
  minSize: null,
  availableFrom: null,
  availableUntil: null,
  propertyTypes: [],
  portals: ["platform-a", "platform-b", "platform-c"],
  features: null,
  onlyNew: true,
};
