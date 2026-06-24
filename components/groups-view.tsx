"use client"

import { useMemo } from "react"
import { GROUP_IDS } from "@/lib/teams"
import { GroupCard } from "@/components/group-card"
import { useTournament } from "@/components/tournament-provider"
import { rankedThirdPlaces } from "@/lib/engine"

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className="inline-block h-3 w-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  )
}

export function GroupsView() {
  const { state, standings } = useTournament()

  const qualifiedThirds = useMemo(() => {
    const thirds = rankedThirdPlaces(standings, state.groupMatches)
    return new Set(thirds.map((t) => t.teamId))
  }, [standings, state.groupMatches])

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fase de Grupos</h2>
          <p className="text-sm text-muted-foreground">
            12 grupos · 48 selecciones · Carga los resultados y la tabla se
            actualiza sola.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <LegendDot color="var(--qualified-first)" label="1° clasificado" />
          <LegendDot color="var(--qualified-second)" label="2° clasificado" />
          <LegendDot color="var(--qualified-third)" label="Mejor 3°" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {GROUP_IDS.map((g) => (
          <GroupCard key={g} group={g} qualifiedThirds={qualifiedThirds} />
        ))}
      </div>
    </section>
  )
}
