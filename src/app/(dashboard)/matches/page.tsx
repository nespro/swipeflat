"use client";

import { MatchesGrid } from "@/components/matches/matches-grid";

/**
 * Matches page — displays all liked and super-liked listings.
 */
export default function MatchesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card px-4 py-4 lg:px-8">
        <h1 className="text-2xl font-bold">
          Your <span className="text-brand">Matches</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Apartments you liked — review and take action
        </p>
      </header>

      <div className="flex-1 p-4 lg:p-8">
        <MatchesGrid />
      </div>
    </div>
  );
}
