"use client";

import { useState, useCallback, useEffect } from "react";
import { Heart, X, Star, Undo2, SlidersHorizontal, MapPin, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SwipeCard } from "./swipe-card";
import { useSwipeStore } from "@/stores/use-swipe-store";
import type { Listing, SwipeDirection } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface SwipeStackProps {
  onShowDetail: (listing: Listing) => void;
  onOpenFilters: () => void;
}

/**
 * SwipeStack — manages the visible stack of swipe cards.
 *
 * Renders up to 3 cards (top is interactive, others peek behind).
 * All swipe triggers (drag, button, keyboard) go through `buttonSwipe`
 * state so the exit animation always plays before the card is removed.
 */
export function SwipeStack({ onShowDetail, onOpenFilters }: SwipeStackProps) {
  const {
    currentListings,
    currentIndex,
    isLoading,
    swipe,
    undoLastSwipe,
    lastSwipe,
    loadListings,
    locationFallback,
    availableCities,
  } = useSwipeStore();

  /**
   * When set, the top card plays its exit animation in the given direction.
   * Cleared after the animation completes and the store is updated.
   */
  const [buttonSwipe, setButtonSwipe] = useState<SwipeDirection | null>(null);

  const remainingListings = currentListings.slice(currentIndex);
  const visibleCards = remainingListings.slice(0, 3);
  const isEmpty = remainingListings.length === 0 && !isLoading;

  /**
   * Called by SwipeCard AFTER its exit animation finishes.
   * This is the single place where we commit the swipe to the store.
   */
  const handleSwipeComplete = useCallback(
    (listing: Listing, direction: SwipeDirection) => {
      swipe(listing, direction);
      setButtonSwipe(null);
    },
    [swipe]
  );

  /**
   * Trigger a swipe from button or keyboard.
   * We just set the direction; the card picks it up via the buttonSwipe prop,
   * plays the animation, and calls handleSwipeComplete when done.
   */
  const triggerSwipe = useCallback(
    (direction: SwipeDirection) => {
      if (buttonSwipe || visibleCards.length === 0) return;
      setButtonSwipe(direction);
    },
    [buttonSwipe, visibleCards.length]
  );

  /** Keyboard shortcuts */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isEmpty || visibleCards.length === 0) return;

      switch (e.key) {
        case "ArrowLeft":
          triggerSwipe("DISLIKE");
          break;
        case "ArrowRight":
          triggerSwipe("LIKE");
          break;
        case "ArrowUp":
          e.preventDefault();
          triggerSwipe("SUPERLIKE");
          break;
        case "z":
          if (e.ctrlKey || e.metaKey) undoLastSwipe();
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEmpty, visibleCards, triggerSwipe, undoLastSwipe]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      {/* Location fallback notice */}
      {locationFallback && !isLoading && !isEmpty && (
        <div className="w-full flex items-start gap-2 rounded-lg bg-info/10 border border-info/20 px-3 py-2">
          <Info className="h-4 w-4 text-info mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-medium text-foreground">
              No listings found in &ldquo;{locationFallback}&rdquo;
            </p>
            <p className="text-muted-foreground mt-0.5">
              Showing all available listings instead. Try:{" "}
              {availableCities.slice(0, 8).map((city, i) => (
                <span key={city}>
                  {i > 0 && ", "}
                  <span className="font-medium text-foreground">{city}</span>
                </span>
              ))}
              {availableCities.length > 8 && (
                <span className="text-muted-foreground">
                  {" "}and {availableCities.length - 8} more
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Card stack area */}
      <div className="relative w-full aspect-[3/4] max-h-[70vh]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">
                Finding apartments...
              </p>
            </div>
          </div>
        )}

        {isEmpty && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-center space-y-4 p-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <SlidersHorizontal className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No more listings</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                You&apos;ve seen all available apartments matching your filters.
                Try adjusting your search or check back later.
              </p>
              {availableCities.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                  <span className="text-xs text-muted-foreground">Available areas:</span>
                  {availableCities.slice(0, 10).map((city) => (
                    <Badge key={city} variant="secondary" className="text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      {city}
                    </Badge>
                  ))}
                  {availableCities.length > 10 && (
                    <Badge variant="secondary" className="text-xs">
                      +{availableCities.length - 10} more
                    </Badge>
                  )}
                </div>
              )}
              <Button
                onClick={() => loadListings()}
                className="bg-brand hover:bg-brand-dark text-white"
              >
                Check for New
              </Button>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {visibleCards.map((listing, i) => (
            <SwipeCard
              key={listing.id}
              listing={listing}
              isTop={i === 0}
              buttonSwipe={i === 0 ? buttonSwipe : null}
              onSwipeComplete={(dir) => handleSwipeComplete(listing, dir)}
              onShowDetail={onShowDetail}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      {!isEmpty && visibleCards.length > 0 && (
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full border-2 border-muted-foreground/30 hover:border-danger hover:bg-danger/10 hover:text-danger transition-colors"
            onClick={() => triggerSwipe("DISLIKE")}
            disabled={!!buttonSwipe}
            aria-label="Dislike"
          >
            <X className="h-6 w-6" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-2 border-muted-foreground/30 hover:border-warning hover:bg-warning/10 hover:text-warning transition-colors"
            onClick={undoLastSwipe}
            disabled={!lastSwipe}
            aria-label="Undo last swipe"
          >
            <Undo2 className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-full border-2 border-brand hover:bg-brand/10 text-brand transition-colors"
            onClick={() => triggerSwipe("LIKE")}
            disabled={!!buttonSwipe}
            aria-label="Like"
          >
            <Heart className="h-7 w-7" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-2 border-muted-foreground/30 hover:border-info hover:bg-info/10 hover:text-info transition-colors"
            onClick={() => triggerSwipe("SUPERLIKE")}
            disabled={!!buttonSwipe}
            aria-label="Super Like"
          >
            <Star className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full border-2 border-muted-foreground/30 hover:border-success hover:bg-success/10 hover:text-success transition-colors opacity-0 pointer-events-none"
            aria-label="Placeholder"
          >
            <span />
          </Button>
        </div>
      )}

      {/* Progress indicator */}
      {currentListings.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {currentIndex} / {currentListings.length} reviewed
        </p>
      )}
    </div>
  );
}
