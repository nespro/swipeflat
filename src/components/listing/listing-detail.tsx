"use client";

import { useState } from "react";
import {
  MapPin,
  Bed,
  Maximize,
  Calendar,
  ExternalLink,
  Building,
  Banknote,
  ChevronLeft,
  ChevronRight,
  X,
  Share2,
  ImageOff,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { format } from "date-fns";
import type { Listing } from "@/types";

interface ListingDetailProps {
  listing: Listing | null;
  open: boolean;
  onClose: () => void;
}

const FEATURE_LABELS: Record<string, string> = {
  balcony: "Balcony",
  parking: "Parking",
  elevator: "Elevator",
  petsAllowed: "Pets Allowed",
  dishwasher: "Dishwasher",
  washingMachine: "Washing Machine",
  furnished: "Furnished",
  garden: "Garden",
};

/**
 * ListingDetail — a slide-in drawer showing full listing information.
 * Includes all images, description, financial breakdown, features, and external link.
 */
export function ListingDetail({ listing, open, onClose }: ListingDetailProps) {
  const [imageIndex, setImageIndex] = useState(0);

  if (!listing) return null;

  const features = listing.features || {};
  const activeFeatures = Object.entries(features)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const totalCost = listing.rent + (listing.additionalCosts || 0);

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg p-0 overflow-hidden"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{listing.title}</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-full">
          <div className="flex flex-col">
            {/* Image gallery */}
            <div className="relative aspect-[4/3] bg-muted">
              {listing.images.length > 0 ? (
                <img
                  src={listing.images[imageIndex]}
                  alt={`${listing.title} - Photo ${imageIndex + 1}`}
                  className="w-full h-full object-cover"
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
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View original listing
                  </a>
                </div>
              )}

              {/* Navigation */}
              {listing.images.length > 1 && (
                <>
                  {imageIndex > 0 && (
                    <button
                      onClick={() => setImageIndex(imageIndex - 1)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                  )}
                  {imageIndex < listing.images.length - 1 && (
                    <button
                      onClick={() => setImageIndex(imageIndex + 1)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5"
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
                    <div className="flex items-center gap-1.5">
                      {listing.images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setImageIndex(i)}
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

              {/* Close button */}
              <SheetClose asChild>
                <button className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5">
                  <X className="h-5 w-5" />
                </button>
              </SheetClose>

              {listing.portal && (
                <Badge className="absolute top-3 left-3 bg-black/50 text-white border-0">
                  {listing.portal.name}
                </Badge>
              )}
            </div>

            {/* Content */}
            <div className="p-5 space-y-5">
              {/* Title + Price */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-bold leading-tight">
                    {listing.title}
                  </h2>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold tabular-nums text-brand">
                    {listing.rent.toLocaleString("de-CH")} CHF
                  </span>
                  <span className="text-sm text-muted-foreground">/ month</span>
                </div>
              </div>

              <Separator />

              {/* Key metrics */}
              <div className="grid grid-cols-2 gap-3">
                {listing.rooms && (
                  <div className="flex items-center gap-2 text-sm">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <strong>{listing.rooms}</strong> rooms
                    </span>
                  </div>
                )}
                {listing.sizeSqm && (
                  <div className="flex items-center gap-2 text-sm">
                    <Maximize className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <strong>{listing.sizeSqm}</strong> m²
                    </span>
                  </div>
                )}
                {listing.floor !== null && listing.floor !== undefined && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Floor <strong>{listing.floor}</strong>
                    </span>
                  </div>
                )}
                {listing.availableFrom && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      From{" "}
                      <strong>
                        {format(new Date(listing.availableFrom), "dd.MM.yyyy")}
                      </strong>
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Financials */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Costs</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                    <span>Rent: {listing.rent.toLocaleString("de-CH")} CHF</span>
                  </div>
                  {listing.additionalCosts !== null && (
                    <div className="text-muted-foreground">
                      + {listing.additionalCosts} CHF additional
                    </div>
                  )}
                  <div className="font-semibold col-span-2 text-brand">
                    Total: {totalCost.toLocaleString("de-CH")} CHF / month
                  </div>
                  {listing.deposit && (
                    <div className="text-muted-foreground col-span-2">
                      Deposit: {listing.deposit.toLocaleString("de-CH")} CHF
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Location</h3>
                <p className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  {listing.address}, {listing.zipCode} {listing.city}
                </p>
              </div>

              {/* Features */}
              {activeFeatures.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {activeFeatures.map((feat) => (
                      <Badge key={feat} variant="secondary">
                        {FEATURE_LABELS[feat] || feat}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {listing.description && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Description</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {listing.description}
                  </p>
                </div>
              )}

              <Separator />

              {/* Actions */}
              <div className="flex gap-3">
                <Button asChild className="flex-1 bg-brand hover:bg-brand-dark text-white">
                  <a
                    href={listing.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Portal
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(listing.portalUrl);
                  }}
                  aria-label="Share"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
