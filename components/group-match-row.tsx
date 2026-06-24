"use client"

import type { GroupMatch } from "@/lib/types"
import { TeamLabel } from "@/components/team-label"
import { ScoreInput } from "@/components/score-input"
import { useTournament } from "@/components/tournament-provider"
import { getTeam } from "@/lib/teams"
import { cn } from "@/lib/utils"

export function GroupMatchRow({ match }: { match: GroupMatch }) {
  const { setGroupResult } = useTournament()
  const played = match.homeGoals !== null && match.awayGoals !== null
  const homeWin = played && match.homeGoals! > match.awayGoals!
  const awayWin = played && match.awayGoals! > match.homeGoals!

  const home = getTeam(match.homeId)
  const away = getTeam(match.awayId)

  return (
    <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent/50">
      <div className="flex flex-1 justify-end">
        <TeamLabel
          teamId={match.homeId}
          reverse
          flagClassName="h-4 w-6 shrink-0"
          highlight={homeWin}
          nameClassName={cn("text-right", awayWin && "text-muted-foreground")}
        />
      </div>
      <div className="flex items-center gap-1">
        <ScoreInput
          value={match.homeGoals}
          ariaLabel={`Goles de ${home?.name ?? "local"}`}
          onChange={(v) => setGroupResult(match.id, v, match.awayGoals)}
        />
        <span className="text-xs font-medium text-muted-foreground">-</span>
        <ScoreInput
          value={match.awayGoals}
          ariaLabel={`Goles de ${away?.name ?? "visitante"}`}
          onChange={(v) => setGroupResult(match.id, match.homeGoals, v)}
        />
      </div>
      <div className="flex flex-1 justify-start">
        <TeamLabel
          teamId={match.awayId}
          flagClassName="h-4 w-6 shrink-0"
          highlight={awayWin}
          nameClassName={cn(homeWin && "text-muted-foreground")}
        />
      </div>
    </div>
  )
}
