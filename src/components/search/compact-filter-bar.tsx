"use client";

import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import type { SearchFilters } from "@/types";
import {
  RADIUS_OPTIONS,
  PRICE_OPTIONS,
  ROOM_OPTIONS,
  PORTAL_OPTIONS,
  PROPERTY_TYPES,
  DEFAULT_FILTERS,
} from "@/types";

interface CompactFilterBarProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
  isLoading?: boolean;
  resultCount?: number;
}

/**
 * CompactFilterBar — inline search bar for the swipe page header.
 *
 * Row 1: location input + radius dropdown + search button
 * Row 2 (collapsible): price, rooms, portals, features, etc.
 */
export function CompactFilterBar({
  onSearch,
  initialFilters,
  isLoading = false,
  resultCount,
}: CompactFilterBarProps) {
  const [filters, setFilters] = useState<SearchFilters>(
    initialFilters || DEFAULT_FILTERS
  );
  const [expanded, setExpanded] = useState(false);

  function updateFilter<K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function toggleFeature(feature: string) {
    setFilters((prev) => {
      const current = prev.features || {};
      return { ...prev, features: { ...current, [feature]: !current[feature] } };
    });
  }

  function handleSearch() {
    onSearch(filters);
    setExpanded(false);
  }

  function handleReset() {
    const reset = DEFAULT_FILTERS;
    setFilters(reset);
    onSearch(reset);
  }

  /** Count active filters beyond defaults */
  const activeCount = [
    filters.location,
    filters.radiusKm > 0,
    filters.maxRent,
    filters.minRooms,
    filters.minSize,
    filters.availableFrom,
    filters.propertyTypes.length > 0,
    filters.features && Object.values(filters.features).some(Boolean),
  ].filter(Boolean).length;

  return (
    <div className="w-full space-y-2">
      {/* Row 1: Location + Radius + Search */}
      <div className="flex items-center gap-1.5">
        {/* Location input */}
        <div className="relative flex-1 min-w-0">
          <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="City or zip..."
            value={filters.location}
            onChange={(e) => updateFilter("location", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="h-9 pl-8 text-sm bg-card border-border"
          />
        </div>

        {/* Radius */}
        <Select
          value={String(filters.radiusKm)}
          onValueChange={(v) => updateFilter("radiusKm", Number(v))}
        >
          <SelectTrigger className="h-9 w-[88px] text-xs bg-card border-border shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RADIUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* More filters toggle */}
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 flex-shrink-0 relative"
          onClick={() => setExpanded(!expanded)}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {activeCount > 1 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </Button>

        {/* Search button */}
        <Button
          onClick={handleSearch}
          disabled={isLoading}
          className="h-9 px-3 bg-brand hover:bg-brand-dark text-white flex-shrink-0"
        >
          <Search className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Expanded filter panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-card rounded-lg border border-border space-y-3">
              {/* Row: Price + Rooms */}
              <div className="flex items-center gap-2">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Max Rent
                  </Label>
                  <Select
                    value={filters.maxRent ? String(filters.maxRent) : "any"}
                    onValueChange={(v) =>
                      updateFilter("maxRent", v === "any" ? null : Number(v))
                    }
                  >
                    <SelectTrigger className="h-8 text-xs bg-secondary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICE_OPTIONS.map((opt) => (
                        <SelectItem
                          key={opt.value ?? "any"}
                          value={opt.value ? String(opt.value) : "any"}
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Min Rooms
                  </Label>
                  <Select
                    value={filters.minRooms ? String(filters.minRooms) : "any"}
                    onValueChange={(v) =>
                      updateFilter("minRooms", v === "any" ? null : Number(v))
                    }
                  >
                    <SelectTrigger className="h-8 text-xs bg-secondary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROOM_OPTIONS.map((opt) => (
                        <SelectItem
                          key={opt.value ?? "any"}
                          value={opt.value ? String(opt.value) : "any"}
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Min m²
                  </Label>
                  <Input
                    type="number"
                    placeholder="—"
                    value={filters.minSize ?? ""}
                    onChange={(e) =>
                      updateFilter(
                        "minSize",
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    className="h-8 text-xs bg-secondary/50"
                  />
                </div>
              </div>

              {/* Row: Available from */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground w-14">
                  From
                </span>
                <Input
                  type="date"
                  value={filters.availableFrom ?? ""}
                  onChange={(e) =>
                    updateFilter("availableFrom", e.target.value || null)
                  }
                  className="h-8 text-xs flex-1 bg-secondary/50"
                />
              </div>

              {/* Portals */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-muted-foreground w-14">
                  Portals
                </span>
                {PORTAL_OPTIONS.map((portal) => (
                  <Badge
                    key={portal.value}
                    variant={
                      filters.portals.includes(portal.value)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer select-none text-xs h-6"
                    onClick={() => {
                      const portals = filters.portals.includes(portal.value)
                        ? filters.portals.filter((p) => p !== portal.value)
                        : [...filters.portals, portal.value];
                      updateFilter("portals", portals);
                    }}
                  >
                    {portal.label}
                  </Badge>
                ))}
              </div>

              {/* Property type pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-muted-foreground w-14">
                  Type
                </span>
                {PROPERTY_TYPES.map((type) => (
                  <Badge
                    key={type.value}
                    variant={
                      filters.propertyTypes.includes(type.value)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer select-none text-xs h-6"
                    onClick={() => {
                      const types = filters.propertyTypes.includes(type.value)
                        ? filters.propertyTypes.filter((t) => t !== type.value)
                        : [...filters.propertyTypes, type.value];
                      updateFilter("propertyTypes", types);
                    }}
                  >
                    {type.label}
                  </Badge>
                ))}
              </div>

              {/* Feature toggles */}
              <div className="flex items-start gap-2 flex-wrap">
                <span className="text-xs font-medium text-muted-foreground w-14 pt-0.5">
                  Features
                </span>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {[
                    { key: "balcony", label: "Balcony" },
                    { key: "parking", label: "Parking" },
                    { key: "elevator", label: "Elevator" },
                    { key: "petsAllowed", label: "Pets" },
                    { key: "furnished", label: "Furnished" },
                    { key: "washingMachine", label: "Washer" },
                    { key: "garden", label: "Garden" },
                  ].map((feat) => (
                    <label
                      key={feat.key}
                      className="flex items-center gap-1.5 text-xs cursor-pointer"
                    >
                      <Checkbox
                        className="h-3.5 w-3.5"
                        checked={!!filters.features?.[feat.key]}
                        onCheckedChange={() => toggleFeature(feat.key)}
                      />
                      {feat.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Only new + actions */}
              <div className="flex items-center justify-between pt-1 border-t border-border">
                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <Checkbox
                    className="h-3.5 w-3.5"
                    checked={filters.onlyNew}
                    onCheckedChange={(checked) =>
                      updateFilter("onlyNew", !!checked)
                    }
                  />
                  <span className="font-medium">New only</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReset}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Reset
                  </button>
                  <Button
                    onClick={handleSearch}
                    disabled={isLoading}
                    size="sm"
                    className="h-7 px-3 text-xs bg-brand hover:bg-brand-dark text-white"
                  >
                    {isLoading
                      ? "..."
                      : resultCount !== undefined
                        ? `${resultCount} results`
                        : "Apply"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
