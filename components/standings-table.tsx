import type { StandingRow } from "@/lib/types"
import { TeamLabel } from "@/components/team-label"
import { cn } from "@/lib/utils"

interface StandingsTableProps {
  rows: StandingRow[]
  /** Set of team ids that qualify as one of the 8 best third places */
  qualifiedThirds: Set<string>
}

const COLS = [
  { key: "played", label: "PJ", title: "Partidos jugados" },
  { key: "won", label: "PG", title: "Partidos ganados" },
  { key: "drawn", label: "PE", title: "Partidos empatados" },
  { key: "lost", label: "PP", title: "Partidos perdidos" },
  { key: "goalsFor", label: "GF", title: "Goles a favor" },
  { key: "goalsAgainst", label: "GC", title: "Goles en contra" },
  { key: "goalDiff", label: "DG", title: "Diferencia de gol" },
] as const

export function StandingsTable({ rows, qualifiedThirds }: StandingsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-muted-foreground">
            <th className="w-7 px-1 py-2 text-center font-medium">#</th>
            <th className="px-2 py-2 text-left font-medium">Equipo</th>
            {COLS.map((c) => (
              <th
                key={c.key}
                title={c.title}
                className="w-9 px-1 py-2 text-center font-medium tabular-nums"
              >
                {c.label}
              </th>
            ))}
            <th
              title="Puntos"
              className="w-10 px-1 py-2 text-center font-semibold tabular-nums"
            >
              PTS
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isFirst = row.position === 1
            const isSecond = row.position === 2
            const isThirdQ = row.position === 3 && qualifiedThirds.has(row.teamId)
            return (
              <tr
                key={row.teamId}
                className={cn(
                  "border-t border-border/60 transition-colors",
                  (isFirst || isSecond || isThirdQ) && "bg-accent/40",
                )}
              >
                <td className="px-1 py-2 text-center">
                  <span
                    className={cn(
                      "inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold",
                      isFirst &&
                        "bg-[var(--qualified-first)] text-primary-foreground",
                      isSecond &&
                        "bg-[var(--qualified-second)] text-primary-foreground",
                      isThirdQ &&
                        "bg-[var(--qualified-third)] text-gold-foreground",
                      !isFirst &&
                        !isSecond &&
                        !isThirdQ &&
                        "text-muted-foreground",
                    )}
                  >
                    {row.position}
                  </span>
                </td>
                <td className="px-2 py-2">
                  <TeamLabel
                    teamId={row.teamId}
                    flagClassName="h-4 w-6 shrink-0"
                    nameClassName="text-foreground"
                    highlight={isFirst || isSecond || isThirdQ}
                  />
                </td>
                {COLS.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      "px-1 py-2 text-center tabular-nums",
                      c.key === "goalDiff" && "text-muted-foreground",
                    )}
                  >
                    {c.key === "goalDiff" && row.goalDiff > 0
                      ? `+${row.goalDiff}`
                      : row[c.key]}
                  </td>
                ))}
                <td className="px-1 py-2 text-center font-bold tabular-nums">
                  {row.points}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
