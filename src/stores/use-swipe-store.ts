import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Listing, SearchFilters, SwipeDirection } from "@/types";
import { DEFAULT_FILTERS } from "@/types";
import { filterListings, getAvailableCities } from "@/lib/client-filters";

/**
 * Core swipe store — manages the listing queue, swipe history, and filter state.
 *
 * Data flow (static build):
 * 1. `loadListings()` fetches `/data/listings.json` (placeholder demo dataset)
 * 2. Client-side filtering is applied using the active filters
 * 3. No server-side API calls or sync needed at runtime
 *
 * Persistence strategy:
 * - swipedIds + activeFilters are persisted (lightweight, no listing data)
 * - likedListings / superlikedListings store only listing IDs
 * - Full listing objects are resolved from the static data
 *
 * Bump `version` when the persisted shape changes to invalidate old caches.
 */

interface SwipeStore {
  /** All listings loaded from static JSON (unfiltered) */
  allListings: Listing[];
  /** Filtered listings currently visible in the swipe queue */
  currentListings: Listing[];
  currentIndex: number;
  isLoading: boolean;

  /** Persisted: map of listing ID → swipe direction */
  swipedIds: Record<string, SwipeDirection>;
  /** Persisted: IDs only — resolved to full listings via lookup */
  likedIds: string[];
  superlikedIds: string[];
  /** Transient: last swipe for undo */
  lastSwipe: { listing: Listing; direction: SwipeDirection } | null;

  /**
   * Transient: set when the user searched a location that returned no results
   * and we fell back to showing all listings instead.
   */
  locationFallback: string | null;

  activeFilters: SearchFilters;

  /** Available cities derived from the full listing set */
  availableCities: string[];

  /** Computed getters */
  getLikedListings: () => Listing[];
  getSuperlikedListings: () => Listing[];

  /** Actions */
  loadListings: (filters?: SearchFilters) => Promise<void>;
  swipe: (listing: Listing, direction: SwipeDirection) => void;
  undoLastSwipe: () => void;
  setFilters: (filters: SearchFilters) => void;
  resetHistory: () => void;
}

function resolveListing(
  id: string,
  currentListings: Listing[]
): Listing | undefined {
  return currentListings.find((l) => l.id === id);
}

export const useSwipeStore = create<SwipeStore>()(
  persist(
    (set, get) => ({
      allListings: [],
      currentListings: [],
      currentIndex: 0,
      isLoading: false,
      swipedIds: {},
      likedIds: [],
      superlikedIds: [],
      lastSwipe: null,
      locationFallback: null,
      availableCities: [],
      activeFilters: DEFAULT_FILTERS,

      getLikedListings: () => {
        const state = get();
        const pool = state.allListings.length > 0 ? state.allListings : state.currentListings;
        return state.likedIds
          .map((id) => resolveListing(id, pool))
          .filter((l): l is Listing => l !== undefined);
      },

      getSuperlikedListings: () => {
        const state = get();
        const pool = state.allListings.length > 0 ? state.allListings : state.currentListings;
        return state.superlikedIds
          .map((id) => resolveListing(id, pool))
          .filter((l): l is Listing => l !== undefined);
      },

      /**
       * Load listings from static JSON and apply client-side filters.
       */
      loadListings: async (filters) => {
        const state = get();
        const activeFilters = filters || state.activeFilters;

        set({ isLoading: true });

        try {
          let allListings = state.allListings;

          // Fetch static data if not already in memory
          if (allListings.length === 0) {
            const res = await fetch("/data/listings.json");
            const data = await res.json();
            allListings = data.listings || [];
          }

          const excludeIds = activeFilters.onlyNew
            ? new Set(Object.keys(state.swipedIds))
            : undefined;

          let filtered = filterListings(allListings, {
            location: activeFilters.location || undefined,
            radiusKm: activeFilters.radiusKm,
            maxRent: activeFilters.maxRent ?? undefined,
            minRooms: activeFilters.minRooms ?? undefined,
            excludeIds,
          });

          let locationFallback: string | null = null;

          // Fallback: if location filter returned 0 results, show all
          if (filtered.length === 0 && activeFilters.location) {
            filtered = filterListings(allListings, {
              maxRent: activeFilters.maxRent ?? undefined,
              minRooms: activeFilters.minRooms ?? undefined,
              excludeIds,
            });
            locationFallback = activeFilters.location;
          }

          set({
            allListings,
            currentListings: filtered,
            currentIndex: 0,
            isLoading: false,
            activeFilters,
            locationFallback,
            availableCities: getAvailableCities(allListings),
          });
        } catch (error) {
          console.error("Failed to load listings:", error);
          set({ isLoading: false, activeFilters });
        }
      },

      swipe: (listing, direction) => {
        const state = get();
        const newSwipedIds = { ...state.swipedIds, [listing.id]: direction };

        const newLikedIds =
          direction === "LIKE"
            ? [listing.id, ...state.likedIds.filter((id) => id !== listing.id)]
            : state.likedIds;
        const newSuperlikedIds =
          direction === "SUPERLIKE"
            ? [
                listing.id,
                ...state.superlikedIds.filter((id) => id !== listing.id),
              ]
            : state.superlikedIds;

        set({
          swipedIds: newSwipedIds,
          likedIds: newLikedIds,
          superlikedIds: newSuperlikedIds,
          currentIndex: state.currentIndex + 1,
          lastSwipe: { listing, direction },
        });
      },

      undoLastSwipe: () => {
        const state = get();
        if (!state.lastSwipe) return;

        const { listing, direction } = state.lastSwipe;
        const newSwipedIds = { ...state.swipedIds };
        delete newSwipedIds[listing.id];

        const newLikedIds =
          direction === "LIKE"
            ? state.likedIds.filter((id) => id !== listing.id)
            : state.likedIds;
        const newSuperlikedIds =
          direction === "SUPERLIKE"
            ? state.superlikedIds.filter((id) => id !== listing.id)
            : state.superlikedIds;

        set({
          swipedIds: newSwipedIds,
          likedIds: newLikedIds,
          superlikedIds: newSuperlikedIds,
          currentIndex: Math.max(0, state.currentIndex - 1),
          lastSwipe: null,
        });
      },

      setFilters: (filters) => {
        set({ activeFilters: filters });
      },

      resetHistory: () => {
        set({
          swipedIds: {},
          likedIds: [],
          superlikedIds: [],
          currentIndex: 0,
          lastSwipe: null,
        });
      },
    }),
    {
      name: "swipeflat-swipe-store",
      version: 5, // v5: static build, no server sync
      migrate: (persisted, version) => {
        const state = persisted as Record<string, unknown>;
        if (version < 4) {
          state.activeFilters = DEFAULT_FILTERS;
        }
        return state;
      },
      partialize: (state) => ({
        swipedIds: state.swipedIds,
        likedIds: state.likedIds,
        superlikedIds: state.superlikedIds,
        activeFilters: state.activeFilters,
      }),
    }
  )
);
