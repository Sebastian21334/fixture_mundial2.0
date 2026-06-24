"use client"

import type { KnockoutMatch } from "@/lib/types"
import { TeamLabel } from "@/components/team-label"
import { ScoreInput } from "@/components/score-input"
import { useTournament } from "@/components/tournament-provider"
import { knockoutResultWinner, type ResolvedTeamRef } from "@/lib/engine"
import { cn } from "@/lib/utils"

interface Props {
  match: KnockoutMatch
  compact?: boolean
}

function TeamRow({
  ref_,
  goals,
  pens,
  showPens,
  isWinner,
  faded,
  onGoals,
  onPens,
  ariaPrefix,
}: {
  ref_: ResolvedTeamRef | undefined
  goals: number | null
  pens: number | null
  showPens: boolean
  isWinner: boolean
  faded: boolean
  onGoals: (v: number | null) => void
  onPens: (v: number | null) => void
  ariaPrefix: string
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2.5 py-1.5",
        isWinner && "bg-primary/10",
      )}
    >
      <TeamLabel
        teamId={ref_?.teamId ?? null}
        placeholder={ref_?.placeholder ?? "Por definir"}
        flagClassName="h-3.5 w-5 shrink-0"
        className="flex-1"
        nameClassName={cn(
          "text-sm",
          isWinner && "font-bold",
          faded && "text-muted-foreground",
        )}
      />
      {showPens && (
        <span className="w-5 text-center text-xs text-muted-foreground tabular-nums">
          {pens ?? "-"}
        </span>
      )}
      <ScoreInput
        value={goals}
        ariaLabel={`${ariaPrefix} goles`}
        onChange={onGoals}
        disabled={!ref_?.teamId}
        className="h-8 w-8"
      />
      {showPens && (
        <ScoreInput
          value={pens}
          ariaLabel={`${ariaPrefix} penales`}
          onChange={onPens}
          disabled={!ref_?.teamId}
          className="h-8 w-8 border-dashed"
        />
      )}
    </div>
  )
}

export function KnockoutMatchCard({ match, compact }: Props) {
  const { resolvedKnockout, setKnockoutResult } = useTournament()
  const resolved = resolvedKnockout.get(match.id)

  const tied =
    match.homeGoals !== null &&
    match.awayGoals !== null &&
    match.homeGoals === match.awayGoals
  const showPens = tied

  const winnerId = knockoutResultWinner(match, resolved)
  const homeWin = winnerId !== null && winnerId === resolved?.home.teamId
  const awayWin = winnerId !== null && winnerId === resolved?.away.teamId

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-card shadow-sm",
        compact ? "w-[230px]" : "w-full",
      )}
    >
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/50 px-2.5 py-1">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {match.label}
        </span>
        {showPens && (
          <span className="text-[10px] font-medium text-muted-foreground">
            penales
          </span>
        )}
      </div>
      <TeamRow
        ref_={resolved?.home}
        goals={match.homeGoals}
        pens={match.homePens}
        showPens={showPens}
        isWinner={homeWin}
        faded={awayWin}
        ariaPrefix={`${match.label} local`}
        onGoals={(v) => setKnockoutResult(match.id, { homeGoals: v })}
        onPens={(v) => setKnockoutResult(match.id, { homePens: v })}
      />
      <div className="border-t border-border/60" />
      <TeamRow
        ref_={resolved?.away}
        goals={match.awayGoals}
        pens={match.awayPens}
        showPens={showPens}
        isWinner={awayWin}
        faded={homeWin}
        ariaPrefix={`${match.label} visitante`}
        onGoals={(v) => setKnockoutResult(match.id, { awayGoals: v })}
        onPens={(v) => setKnockoutResult(match.id, { awayPens: v })}
      />
    </div>
  )
}
