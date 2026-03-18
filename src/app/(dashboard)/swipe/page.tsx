"use client";

import { useEffect, useState } from "react";
import { SwipeStack } from "@/components/swipe/swipe-stack";
import { CompactFilterBar } from "@/components/search/compact-filter-bar";
import { ListingDetail } from "@/components/listing/listing-detail";
import { useSwipeStore } from "@/stores/use-swipe-store";
import type { Listing, SearchFilters } from "@/types";

/**
 * Swipe page — compact search bar on top, swipe cards below.
 * Loads listings from static JSON, filters client-side.
 */
export default function SwipePage() {
  const { currentListings, loadListings, isLoading, activeFilters } =
    useSwipeStore();
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    loadListings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch(filters: SearchFilters) {
    loadListings(filters);
  }

  function handleShowDetail(listing: Listing) {
    setSelectedListing(listing);
    setShowDetail(true);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with branding + compact filter bar */}
      <header className="border-b border-border bg-card px-3 py-2 lg:px-6 space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-bold">
            Swipe<span className="text-brand">Flat</span>
          </h1>
          <span className="text-xs text-muted-foreground tabular-nums">
            {currentListings.length > 0
              ? `${currentListings.length} listings`
              : ""}
          </span>
        </div>
        <CompactFilterBar
          onSearch={handleSearch}
          initialFilters={activeFilters}
          isLoading={isLoading}
          resultCount={
            currentListings.length > 0 ? currentListings.length : undefined
          }
        />
      </header>

      {/* Swipe area — takes remaining space */}
      <div className="flex-1 flex items-center justify-center p-3 pt-2">
        <SwipeStack
          onShowDetail={handleShowDetail}
          onOpenFilters={() => {}}
        />
      </div>

      <ListingDetail
        listing={selectedListing}
        open={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </div>
  );
}
