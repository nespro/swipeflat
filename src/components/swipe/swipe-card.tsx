"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import {
  MapPin,
  Bed,
  Maximize,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ImageOff,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Listing, SwipeDirection } from "@/types";
import { format } from "date-fns";

interface SwipeCardProps {
  listing: Listing;
  /** Called AFTER the exit animation completes — safe to update state. */
  onSwipeComplete: (direction: SwipeDirection) => void;
  isTop: boolean;
  onShowDetail: (listing: Listing) => void;
  /** Set by parent (button/keyboard) to trigger a swipe animation externally. */
  buttonSwipe: SwipeDirection | null;
}

const SWIPE_THRESHOLD = 100;
const SWIPE_UP_THRESHOLD = 80;

/** Map swipe direction to exit animation target. */
const EXIT_TARGETS: Record<string, { x: number; y: number; rotate: number; scale: number }> = {
  right: { x: 1200, y: 80, rotate: 20, scale: 0.85 },
  left: { x: -1200, y: 80, rotate: -20, scale: 0.85 },
  up: { x: 0, y: -900, rotate: 0, scale: 0.85 },
};

const DIRECTION_TO_EXIT: Record<SwipeDirection, string> = {
  LIKE: "right",
  DISLIKE: "left",
  SUPERLIKE: "up",
};

/**
 * SwipeCard — a single listing card with drag-to-swipe physics.
 *
 * Exit animation plays FIRST, then calls onSwipeComplete to update state.
 * This prevents the card from vanishing before the user sees it fly away.
 *
 * Left = dislike, Right = like, Up = superlike.
 */
export function SwipeCard({
  listing,
  onSwipeComplete,
  isTop,
  onShowDetail,
  buttonSwipe,
}: SwipeCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [imageError, setImageError] = useState<Set<number>>(new Set());

  /** Tracks which direction the card is exiting (null = still interactive). */
  const [exitDirection, setExitDirection] = useState<string | null>(null);
  /** The swipe direction to report once animation finishes. */
  const [pendingSwipe, setPendingSwipe] = useState<SwipeDirection | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-18, 0, 18]);
  const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const dislikeOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
  const superlikeOpacity = useTransform(y, [-SWIPE_UP_THRESHOLD, 0], [1, 0]);

  const handleImageError = useCallback((idx: number) => {
    setImageError((prev) => new Set(prev).add(idx));
  }, []);

  /** Start the exit animation. The store update happens on animation complete. */
  function triggerExit(exitDir: string, swipeDir: SwipeDirection) {
    if (exitDirection) return; // already exiting
    setExitDirection(exitDir);
    setPendingSwipe(swipeDir);
  }

  /** Drag released — check if threshold was crossed. */
  function handleDragEnd(_: unknown, info: PanInfo) {
    const xOff = info.offset.x;
    const yOff = info.offset.y;

    if (yOff < -SWIPE_UP_THRESHOLD) {
      triggerExit("up", "SUPERLIKE");
    } else if (xOff > SWIPE_THRESHOLD) {
      triggerExit("right", "LIKE");
    } else if (xOff < -SWIPE_THRESHOLD) {
      triggerExit("left", "DISLIKE");
    }
  }

  /** Called when the exit animation completes — safe to remove the card now. */
  function handleAnimationComplete() {
    if (pendingSwipe) {
      onSwipeComplete(pendingSwipe);
    }
  }

  /** Handle button/keyboard-triggered swipes from parent. */
  useEffect(() => {
    if (buttonSwipe && isTop && !exitDirection) {
      triggerExit(DIRECTION_TO_EXIT[buttonSwipe], buttonSwipe);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buttonSwipe]);

  function nextImage(e: React.MouseEvent) {
    e.stopPropagation();
    if (imageIndex < listing.images.length - 1) setImageIndex(imageIndex + 1);
  }

  function prevImage(e: React.MouseEvent) {
    e.stopPropagation();
    if (imageIndex > 0) setImageIndex(imageIndex - 1);
  }

  /* ---------- Compute animation target ---------- */

  const animateTarget = exitDirection
    ? {
        x: EXIT_TARGETS[exitDirection].x,
        y: EXIT_TARGETS[exitDirection].y,
        rotate: EXIT_TARGETS[exitDirection].rotate,
        scale: EXIT_TARGETS[exitDirection].scale,
        opacity: 0,
      }
    : { x: 0, y: 0, opacity: 1, scale: 1 };

  const transition = exitDirection
    ? { type: "tween" as const, duration: 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }
    : { type: "spring" as const, damping: 30, stiffness: 300 };

  /* ---------- Feature badges ---------- */

  const features = listing.features || {};
  const activeFeatures = Object.entries(features)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const featureLabels: Record<string, string> = {
    balcony: "Balcony",
    parking: "Parking",
    elevator: "Elevator",
    petsAllowed: "Pets OK",
    dishwasher: "Dishwasher",
    washingMachine: "Washer",
    furnished: "Furnished",
    garden: "Garden",
  };

  return (
    <motion.div
      className="swipe-card absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, y, rotate, zIndex: isTop ? 10 : 1 }}
      drag={isTop && !exitDirection}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      animate={animateTarget}
      transition={transition}
      onAnimationComplete={handleAnimationComplete}
    >
      <div className="relative w-full h-full rounded-2xl overflow-hidden bg-card shadow-xl border border-border">
        {/* Image area */}
        <div className="relative h-[60%] bg-muted">
          {listing.images.length > 0 && !imageError.has(imageIndex) ? (
            <img
              src={listing.images[imageIndex]}
              alt={listing.title}
              className="w-full h-full object-cover"
              draggable={false}
              onError={() => handleImageError(imageIndex)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 px-6 text-center bg-gradient-to-b from-muted to-muted/70">
              <ImageOff className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Photos available on portal
              </p>
              <a
                href={listing.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-dark transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View on {listing.portal?.name || "portal"}
              </a>
            </div>
          )}

          {/* Image navigation arrows */}
          {listing.images.length > 1 && (
            <>
              {imageIndex > 0 && (
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              {imageIndex < listing.images.length - 1 && (
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </>
          )}

          {/* Image indicator — dots for <=6, counter for more */}
          {listing.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              {listing.images.length <= 6 ? (
                <div className="flex gap-1.5">
                  {listing.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageIndex(i);
                      }}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i === imageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              ) : (
                <span className="bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full tabular-nums">
                  {imageIndex + 1} / {listing.images.length}
                </span>
              )}
            </div>
          )}

          {/* Swipe direction overlays — fade in as user drags */}
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute inset-0 bg-success/20 flex items-center justify-center pointer-events-none"
          >
            <span className="text-5xl font-bold text-success border-4 border-success rounded-xl px-4 py-2 rotate-[-15deg]">
              LIKE
            </span>
          </motion.div>

          <motion.div
            style={{ opacity: dislikeOpacity }}
            className="absolute inset-0 bg-danger/20 flex items-center justify-center pointer-events-none"
          >
            <span className="text-5xl font-bold text-danger border-4 border-danger rounded-xl px-4 py-2 rotate-[15deg]">
              NOPE
            </span>
          </motion.div>

          <motion.div
            style={{ opacity: superlikeOpacity }}
            className="absolute inset-0 bg-info/20 flex items-center justify-center pointer-events-none"
          >
            <span className="text-5xl font-bold text-info border-4 border-info rounded-xl px-4 py-2">
              SUPER
            </span>
          </motion.div>

          {/* Portal badge */}
          {listing.portal && (
            <Badge className="absolute top-3 left-3 bg-black/50 text-white border-0">
              {listing.portal.name}
            </Badge>
          )}
        </div>

        {/* Content area */}
        <div
          className="h-[40%] p-4 flex flex-col justify-between"
          onClick={() => onShowDetail(listing)}
        >
          <div className="space-y-2">
            {/* Price + title */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-base leading-tight line-clamp-2">
                {listing.title}
              </h3>
              <span className="text-xl font-bold tabular-nums text-brand whitespace-nowrap">
                {listing.rent.toLocaleString("de-CH")} CHF
              </span>
            </div>

            {/* Key metrics */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {listing.rooms && (
                <span className="flex items-center gap-1">
                  <Bed className="h-3.5 w-3.5" />
                  {listing.rooms} rooms
                </span>
              )}
              {listing.sizeSqm && (
                <span className="flex items-center gap-1">
                  <Maximize className="h-3.5 w-3.5" />
                  {listing.sizeSqm} m²
                </span>
              )}
              {listing.availableFrom && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(listing.availableFrom), "dd.MM.yyyy")}
                </span>
              )}
            </div>

            {/* Address */}
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">
                {listing.address}, {listing.zipCode} {listing.city}
              </span>
            </p>
          </div>

          {/* Feature badges */}
          {activeFeatures.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {activeFeatures.slice(0, 5).map((feat) => (
                <Badge
                  key={feat}
                  variant="secondary"
                  className="text-xs font-normal"
                >
                  {featureLabels[feat] || feat}
                </Badge>
              ))}
              {activeFeatures.length > 5 && (
                <Badge variant="secondary" className="text-xs font-normal">
                  +{activeFeatures.length - 5}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
