"use client";

import { useState, useMemo, useEffect } from "react";
import { Heart, X, Star, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSwipeStore } from "@/stores/use-swipe-store";
import { ListingDetail } from "@/components/listing/listing-detail";
import type { Listing, SwipeDirection } from "@/types";

/**
 * History page — full swipe history showing liked, disliked, and super-liked.
 * Resolves swiped IDs to full listing objects from the static data already in memory.
 */
export default function HistoryPage() {
  const { swipedIds, allListings, currentListings, loadListings, resetHistory } =
    useSwipeStore();
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Ensure listings are loaded (in case user navigates here directly)
  useEffect(() => {
    if (allListings.length === 0) loadListings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const history = useMemo(() => {
    const entries: { listing: Listing; direction: SwipeDirection }[] = [];
    const listingMap = new Map<string, Listing>();
    for (const l of allListings) listingMap.set(l.id, l);
    for (const l of currentListings) listingMap.set(l.id, l);

    for (const [id, direction] of Object.entries(swipedIds)) {
      const listing = listingMap.get(id);
      if (listing) {
        entries.push({ listing, direction });
      }
    }

    return entries;
  }, [swipedIds, allListings, currentListings]);

  const likes = history.filter((h) => h.direction === "LIKE");
  const dislikes = history.filter((h) => h.direction === "DISLIKE");
  const superlikes = history.filter((h) => h.direction === "SUPERLIKE");

  const stats = {
    total: history.length,
    liked: likes.length,
    disliked: dislikes.length,
    superliked: superlikes.length,
  };

  function openDetail(listing: Listing) {
    setSelectedListing(listing);
    setShowDetail(true);
  }

  function renderHistoryItem(item: {
    listing: Listing;
    direction: SwipeDirection;
  }) {
    const iconMap = {
      LIKE: <Heart className="h-4 w-4 text-brand" />,
      DISLIKE: <X className="h-4 w-4 text-danger" />,
      SUPERLIKE: <Star className="h-4 w-4 text-info" />,
    };

    return (
      <div
        key={item.listing.id}
        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
        onClick={() => openDetail(item.listing)}
      >
        <div className="w-16 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
          {item.listing.images[0] ? (
            <img
              src={item.listing.images[0]}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-gradient-to-b from-muted to-muted/70">
              {item.listing.portal?.name?.charAt(0) || "—"}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{item.listing.title}</p>
          <p className="text-xs text-muted-foreground">
            {item.listing.rent.toLocaleString("de-CH")} CHF •{" "}
            {item.listing.city}
          </p>
        </div>

        <div className="flex-shrink-0">{iconMap[item.direction]}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card px-4 py-4 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Swipe <span className="text-brand">History</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.total} listings reviewed
            </p>
          </div>
          {stats.total > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetHistory}
              className="text-danger hover:text-danger"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Clear History
            </Button>
          )}
        </div>

        {stats.total > 0 && (
          <div className="flex gap-4 mt-3">
            <Badge variant="secondary" className="gap-1">
              <Heart className="h-3 w-3 text-brand" />
              {stats.liked} liked
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3 w-3 text-info" />
              {stats.superliked} super
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <X className="h-3 w-3 text-danger" />
              {stats.disliked} passed
            </Badge>
          </div>
        )}
      </header>

      <div className="flex-1 p-4 lg:p-8">
        {stats.total === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <RotateCcw className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No history yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Start swiping to build your apartment search history.
            </p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full max-w-2xl mx-auto">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="liked">Liked ({stats.liked})</TabsTrigger>
              <TabsTrigger value="super">
                Super ({stats.superliked})
              </TabsTrigger>
              <TabsTrigger value="passed">
                Passed ({stats.disliked})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-2 mt-4">
              {history.map(renderHistoryItem)}
            </TabsContent>
            <TabsContent value="liked" className="space-y-2 mt-4">
              {likes.map(renderHistoryItem)}
            </TabsContent>
            <TabsContent value="super" className="space-y-2 mt-4">
              {superlikes.map(renderHistoryItem)}
            </TabsContent>
            <TabsContent value="passed" className="space-y-2 mt-4">
              {dislikes.map(renderHistoryItem)}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <ListingDetail
        listing={selectedListing}
        open={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </div>
  );
}
