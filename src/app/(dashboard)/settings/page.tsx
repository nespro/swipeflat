"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Trash2, Database, Info } from "lucide-react";
import { useSwipeStore } from "@/stores/use-swipe-store";

/**
 * Settings page — app preferences, data management, and about info.
 */
export default function SettingsPage() {
  const { swipedIds, resetHistory, likedIds, superlikedIds } = useSwipeStore();
  const totalSwiped = Object.keys(swipedIds).length;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card px-4 py-4 lg:px-8">
        <h1 className="text-2xl font-bold">Settings</h1>
      </header>

      <div className="flex-1 p-4 lg:p-8">
        <div className="max-w-lg mx-auto space-y-6">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Data & Storage
            </h2>
            <div className="bg-card rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Swiped Listings</span>
                </div>
                <Badge variant="secondary">{totalSwiped}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Liked</span>
                <span className="text-sm font-medium">{likedIds.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Super Liked
                </span>
                <span className="text-sm font-medium">
                  {superlikedIds.length}
                </span>
              </div>

              <Separator />

              <p className="text-xs text-muted-foreground">
                Demo mode is active with placeholder listings only.
              </p>

              <Button
                variant="outline"
                className="w-full text-danger hover:text-danger hover:bg-danger/5"
                onClick={resetHistory}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Swipe History
              </Button>
              <p className="text-xs text-muted-foreground">
                This resets your history so you&apos;ll see all listings again.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              About
            </h2>
            <div className="bg-card rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Version</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  0.1.0 (MVP)
                </span>
              </div>

              <Separator />

              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  <strong>SwipeFlat</strong> — Tinder-style apartment hunting.
                </p>
                <p>
                  Swipe through placeholder listings while API integrations are
                  being set up with partner platforms.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Keyboard Shortcuts
            </h2>
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  ["←", "Dislike"],
                  ["→", "Like"],
                  ["↑", "Super Like"],
                  ["Ctrl+Z", "Undo"],
                ].map(([key, action]) => (
                  <div key={key} className="flex items-center gap-2">
                    <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">
                      {key}
                    </kbd>
                    <span className="text-muted-foreground">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
