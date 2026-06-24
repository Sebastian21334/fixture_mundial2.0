"use client"

import { useMemo } from "react"
import type { GroupId } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { StandingsTable } from "@/components/standings-table"
import { GroupMatchRow } from "@/components/group-match-row"
import { useTournament } from "@/components/tournament-provider"
import { isGroupComplete } from "@/lib/engine"
import { cn } from "@/lib/utils"

export function GroupCard({
  group,
  qualifiedThirds,
}: {
  group: GroupId
  qualifiedThirds: Set<string>
}) {
  const { state, standings } = useTournament()
  const rows = standings[group]

  const groupMatches = useMemo(
    () => state.groupMatches.filter((m) => m.group === group),
    [state.groupMatches, group],
  )

  const rounds = useMemo(() => {
    const map = new Map<number, typeof groupMatches>()
    for (const m of groupMatches) {
      if (!map.has(m.round)) map.set(m.round, [])
      map.get(m.round)!.push(m)
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0])
  }, [groupMatches])

  const complete = isGroupComplete(group, state.groupMatches)
  const playedCount = groupMatches.filter(
    (m) => m.homeGoals !== null && m.awayGoals !== null,
  ).length

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
        <h3 className="text-base font-bold">Grupo {group}</h3>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            complete
              ? "bg-primary-foreground/20"
              : "bg-primary-foreground/10",
          )}
        >
          {complete ? "Finalizado" : `${playedCount}/${groupMatches.length} jugados`}
        </span>
      </div>

      <div className="px-3 pt-3">
        <StandingsTable rows={rows} qualifiedThirds={qualifiedThirds} />
      </div>

      <div className="mt-2 border-t border-border px-3 py-3">
        <h4 className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Calendario
        </h4>
        <div className="flex flex-col gap-3">
          {rounds.map(([round, matches]) => (
            <div key={round}>
              <p className="mb-1 px-2 text-[11px] font-medium text-muted-foreground">
                Fecha {round}
              </p>
              <div className="flex flex-col">
                {matches.map((m) => (
                  <GroupMatchRow key={m.id} match={m} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
