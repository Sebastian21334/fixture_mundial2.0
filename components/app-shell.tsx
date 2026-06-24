"use client"

import { useState } from "react"
import { Trophy } from "lucide-react"
import { useTournament } from "@/components/tournament-provider"
import { MainNav } from "@/components/main-nav"
import { Toolbar } from "@/components/toolbar"
import { HomeView } from "@/components/home-view"
import { GroupsView } from "@/components/groups-view"
import { BracketView } from "@/components/bracket-view"
import { StatsView } from "@/components/stats-view"
import type { ViewKey } from "@/lib/types"

const EXPORT_TARGET_ID = "export-target"

export function AppShell() {
  const { hydrated } = useTournament()
  const [view, setView] = useState<ViewKey>("home")

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 no-print">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Trophy className="size-5" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-bold tracking-tight">Mundial 2026</p>
                <p className="text-xs text-muted-foreground">Fixture interactivo</p>
              </div>
            </div>
            <div className="lg:hidden">
              <Toolbar exportTargetId={EXPORT_TARGET_ID} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MainNav active={view} onChange={setView} />
            <div className="hidden lg:block">
              <Toolbar exportTargetId={EXPORT_TARGET_ID} />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {!hydrated ? (
          <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
            Cargando torneo…
          </div>
        ) : (
          <div id={EXPORT_TARGET_ID}>
            {view === "home" && <HomeView onNavigate={setView} />}
            {view === "groups" && <GroupsView />}
            {view === "knockout" && <BracketView />}
            {view === "stats" && <StatsView />}
          </div>
        )}
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground no-print">
        Fixture no oficial con fines de seguimiento. Mundial FIFA 2026 · 48 selecciones.
      </footer>
    </div>
  )
}
