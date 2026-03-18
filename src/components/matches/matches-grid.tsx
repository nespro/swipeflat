"use client";

import { useState, useMemo } from "react";
import {
  Heart,
  Star,
  MapPin,
  Bed,
  Maximize,
  ExternalLink,
  Trash2,
  SlidersHorizontal,
  ArrowUpDown,
  ImageOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSwipeStore } from "@/stores/use-swipe-store";
import { ListingDetail } from "@/components/listing/listing-detail";
import type { Listing } from "@/types";

type SortOption = "date" | "price-asc" | "price-desc" | "rooms";

/**
 * MatchesGrid — displays all liked and super-liked listings.
 * Resolves listing data fresh from the store getters (never from stale cache).
 */
export function MatchesGrid() {
  const { getLikedListings, getSuperlikedListings } = useSwipeStore();
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const likedListings = getLikedListings();
  const superlikedListings = getSuperlikedListings();

  const allMatches = useMemo(() => {
    const combined = [
      ...superlikedListings.map((l) => ({ ...l, _isSuperlike: true as const })),
      ...likedListings.map((l) => ({ ...l, _isSuperlike: false as const })),
    ];

    const seen = new Set<string>();
    const unique = combined.filter((l) => {
      if (seen.has(l.id)) return false;
      seen.add(l.id);
      return true;
    });

    switch (sortBy) {
      case "price-asc":
        return unique.sort((a, b) => a.rent - b.rent);
      case "price-desc":
        return unique.sort((a, b) => b.rent - a.rent);
      case "rooms":
        return unique.sort((a, b) => (b.rooms || 0) - (a.rooms || 0));
      case "date":
      default:
        return unique;
    }
  }, [likedListings, superlikedListings, sortBy]);

  function openDetail(listing: Listing) {
    setSelectedListing(listing);
    setShowDetail(true);
  }

  if (allMatches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Heart className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No matches yet</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Start swiping to find apartments you love. Your liked listings will
          appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Your Matches{" "}
            <span className="text-muted-foreground font-normal">
              ({allMatches.length})
            </span>
          </h2>
        </div>
        <Select
          value={sortBy}
          onValueChange={(v) => setSortBy(v as SortOption)}
        >
          <SelectTrigger className="w-[160px]">
            <ArrowUpDown className="h-3.5 w-3.5 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date liked</SelectItem>
            <SelectItem value="price-asc">Price (low)</SelectItem>
            <SelectItem value="price-desc">Price (high)</SelectItem>
            <SelectItem value="rooms">Rooms</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allMatches.map((listing) => (
          <Card
            key={listing.id}
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
            onClick={() => openDetail(listing)}
          >
            <div className="relative aspect-[16/10] bg-muted">
              {listing.images.length > 0 ? (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-gradient-to-b from-muted to-muted/70">
                  <ImageOff className="h-6 w-6 text-muted-foreground/40" />
                  <span className="text-xs text-muted-foreground">
                    View on portal
                  </span>
                </div>
              )}

              {listing._isSuperlike && (
                <Badge className="absolute top-2 left-2 bg-info text-white border-0">
                  <Star className="h-3 w-3 mr-1" />
                  Super Like
                </Badge>
              )}

              {listing.portal && (
                <Badge className="absolute top-2 right-2 bg-black/50 text-white border-0 text-xs">
                  {listing.portal.name}
                </Badge>
              )}
            </div>

            <CardContent className="p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold leading-tight line-clamp-1">
                  {listing.title}
                </h3>
                <span className="text-sm font-bold tabular-nums text-brand whitespace-nowrap">
                  {listing.rent.toLocaleString("de-CH")}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {listing.rooms && (
                  <span className="flex items-center gap-1">
                    <Bed className="h-3 w-3" />
                    {listing.rooms}
                  </span>
                )}
                {listing.sizeSqm && (
                  <span className="flex items-center gap-1">
                    <Maximize className="h-3 w-3" />
                    {listing.sizeSqm}m²
                  </span>
                )}
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  {listing.city}
                </span>
              </div>

              <div className="flex gap-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs flex-1"
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <a
                    href={listing.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Portal
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ListingDetail
        listing={selectedListing}
        open={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </div>
  );
}
